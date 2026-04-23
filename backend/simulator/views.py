import requests
import json
import math
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .hos_logic import HOSSimulator
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import DriverProfile

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        driver_name = request.data.get('driver_name')
        truck_id = request.data.get('truck_id')

        if not all([email, password, driver_name, truck_id]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=email).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=email, email=email, password=password)
        DriverProfile.objects.create(user=user, full_name=driver_name, truck_id=truck_id)
        
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(username=email, password=password)
        if user:
            profile = user.profile
            return Response({
                "email": user.email,
                "driverName": profile.full_name,
                "truckId": profile.truck_id
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class TripSimulationView(APIView):
    def post(self, request):
        current_loc = request.data.get('current_location')
        pickup_loc = request.data.get('pickup_location')
        dropoff_loc = request.data.get('dropoff_location')
        cycle_used = request.data.get('cycle_used', 0)
        start_time = request.data.get('start_time')
        
        if not all([current_loc, pickup_loc, dropoff_loc]):
            return Response({"error": "Missing locations"}, status=status.HTTP_400_BAD_REQUEST)

        def get_coords(location):
            try:
                resp = requests.get(f"https://nominatim.openstreetmap.org/search?format=json&q={location}", 
                                  headers={'User-Agent': 'SpotterAI/1.0'}, timeout=10)
                data = resp.json()
                if data:
                    return {"lat": float(data[0]['lat']), "lon": float(data[0]['lon']), "name": data[0]['display_name']}
            except: pass
            return None

        current_coords = get_coords(current_loc)
        pickup_coords = get_coords(pickup_loc)
        dropoff_coords = get_coords(dropoff_loc)
        
        if not all([current_coords, pickup_coords, dropoff_coords]):
            return Response({"error": "Geocoding failed."}, status=status.HTTP_400_BAD_REQUEST)

        def get_route(start, end):
            try:
                url = f"https://router.project-osrm.org/route/v1/driving/{start['lon']},{start['lat']};{end['lon']},{start['lat']}?overview=full&geometries=geojson&annotations=true"
                resp = requests.get(url, timeout=10)
                data = resp.json()
                if data['code'] == 'Ok':
                    route = data['routes'][0]
                    return {
                        "distance_miles": route['distance'] * 0.000621371,
                        "duration_hrs": route['duration'] / 3600.0,
                        "geometry": route['geometry']
                    }
            except: pass
            return None

        route_to_pickup = get_route(current_coords, pickup_coords)
        main_trip = get_route(pickup_coords, dropoff_coords)
        
        if not main_trip:
            return Response({"error": "Routing failed."}, status=status.HTTP_400_BAD_REQUEST)

        total_driving_duration = (route_to_pickup['duration_hrs'] if route_to_pickup else 0) + main_trip['duration_hrs']
        total_distance = (route_to_pickup['distance_miles'] if route_to_pickup else 0) + main_trip['distance_miles']
        
        simulator = HOSSimulator(cycle_used, start_time=start_time)
        logs = simulator.simulate_trip(total_distance, total_driving_duration)
        daily_logs = simulator.get_daily_logs()

        def get_coord_at_distance(route_geom, target_miles):
            coords = route_geom['coordinates']
            total_dist_m = 0
            target_m = target_miles / 0.000621371
            def haversine(lon1, lat1, lon2, lat2):
                R = 6371000
                p1, p2 = math.radians(lat1), math.radians(lat2)
                dp, dl = math.radians(lat2-lat1), math.radians(lon2-lon1)
                a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
                return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

            for i in range(len(coords)-1):
                d = haversine(coords[i][0], coords[i][1], coords[i+1][0], coords[i+1][1])
                if total_dist_m + d >= target_m:
                    fraction = (target_m - total_dist_m) / d
                    return [coords[i][1] + (coords[i+1][1]-coords[i][1])*fraction, coords[i][0] + (coords[i+1][0]-coords[i][0])*fraction]
                total_dist_m += d
            return [coords[-1][1], coords[-1][0]]

        stop_markers = []
        time_markers = []
        cumulative_dist = 0
        avg_speed = total_distance / total_driving_duration if total_driving_duration > 0 else 60.0
        
        # --- FUELING LOGIC (Every 1000 miles) ---
        num_fuel_stops = int(total_distance // 1000)
        for i in range(1, num_fuel_stops + 1):
            fuel_dist = i * 1000
            pos = get_coord_at_distance(main_trip['geometry'], fuel_dist)
            stop_markers.append({
                "lat": pos[0], 
                "lon": pos[1], 
                "remark": f"Fueling Stop ({fuel_dist} mi mark)", 
                "time": "Assumed Stop",
                "type": "fuel"
            })

        for log in logs:
            if log['status'] in [1, 2] and log['duration'] >= 0.5:
                pos = get_coord_at_distance(main_trip['geometry'], cumulative_dist)
                stop_markers.append({"lat": pos[0], "lon": pos[1], "remark": log['remark'], "time": log['start_time']})
            if log['status'] == 3:
                if log['duration'] > 3.0:
                    mid_dist = cumulative_dist + (log['duration']/2 * avg_speed)
                    pos = get_coord_at_distance(main_trip['geometry'], mid_dist)
                    total_hrs = mid_dist/avg_speed
                    h = int(total_hrs)
                    m = int((total_hrs - h) * 60)
                    label = f"{h} hr {m} min" if m > 0 else f"{h} hr"
                    time_markers.append({"lat": pos[0], "lon": pos[1], "label": label})
                cumulative_dist += log['duration'] * avg_speed

        return Response({
            "summary": {
                "total_distance": round(total_distance, 2),
                "total_driving_time": round(total_driving_duration, 2),
                "pickup_name": pickup_coords['name'],
                "dropoff_name": dropoff_coords['name']
            },
            "route": { "to_pickup": route_to_pickup['geometry'] if route_to_pickup else None, "to_dropoff": main_trip['geometry'] },
            "stop_markers": stop_markers,
            "time_markers": time_markers,
            "daily_logs": daily_logs,
            "locations": { "current": current_coords, "pickup": pickup_coords, "dropoff": dropoff_coords }
        })
