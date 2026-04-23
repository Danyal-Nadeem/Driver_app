import math
from datetime import datetime, timedelta

class HOSSimulator:
    def __init__(self, current_cycle_used_hrs, start_time=None):
        self.current_cycle_used = float(current_cycle_used_hrs)
        # Parse start_time if it's a string from the frontend
        if isinstance(start_time, str):
            try:
                self.start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            except:
                self.start_time = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            self.start_time = start_time or datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        self.DRIVE_LIMIT = 11.0
        self.ON_DUTY_LIMIT = 14.0
        self.BREAK_REQUIRED_AFTER = 8.0
        self.OFF_DUTY_RESET = 10.0
        self.CYCLE_LIMIT = 70.0
        
        self.elapsed_time = 0.0
        self.driving_since_reset = 0.0
        self.on_duty_since_reset = 0.0
        self.driving_since_break = 0.0
        self.cycle_total = self.current_cycle_used
        
        self.logs = []

    def add_log(self, status, duration_hrs, remark=""):
        current_dt = self.start_time + timedelta(hours=self.elapsed_time)
        self.logs.append({
            'start_time': current_dt.isoformat(),
            'status': status,
            'duration': duration_hrs,
            'remark': remark,
            'cycle_at_end': self.cycle_total + (duration_hrs if status in [3, 4] else 0)
        })
        self.elapsed_time += duration_hrs
        
        if status in [3, 4]:
            self.on_duty_since_reset += duration_hrs
            self.cycle_total += duration_hrs
            if status == 3:
                self.driving_since_reset += duration_hrs
                self.driving_since_break += duration_hrs
        
        if status in [1, 2] and duration_hrs >= 10.0:
            self.driving_since_reset = 0.0
            self.on_duty_since_reset = 0.0
            self.driving_since_break = 0.0

    def simulate_trip(self, total_distance_miles, driving_duration_hrs):
        # 1. Pickup (Assumption: 1 hour)
        self.add_log(4, 1.0, "Pickup / Loading")
        
        miles_covered = 0.0
        miles_since_fuel = 0.0
        remaining_driving_hrs = driving_duration_hrs
        avg_speed = total_distance_miles / driving_duration_hrs if driving_duration_hrs > 0 else 60.0

        while remaining_driving_hrs > 0:
            can_drive_today = self.DRIVE_LIMIT - self.driving_since_reset
            can_drive_window = self.ON_DUTY_LIMIT - self.on_duty_since_reset
            can_drive_before_break = self.BREAK_REQUIRED_AFTER - self.driving_since_break
            can_drive_cycle = self.CYCLE_LIMIT - self.cycle_total
            
            # Distance to next fuel stop (Assumption: Fuel every 1000 miles)
            miles_to_fuel = 1000.0 - miles_since_fuel
            hours_to_fuel = miles_to_fuel / avg_speed
            
            possible_drive_segment = min(
                remaining_driving_hrs, 
                can_drive_today, 
                can_drive_window, 
                can_drive_before_break,
                can_drive_cycle,
                hours_to_fuel
            )

            if possible_drive_segment > 0:
                self.add_log(3, possible_drive_segment, "Driving")
                remaining_driving_hrs -= possible_drive_segment
                segment_miles = possible_drive_segment * avg_speed
                miles_covered += segment_miles
                miles_since_fuel += segment_miles
                self.logs[-1]['distance'] = segment_miles
            
            if remaining_driving_hrs <= 0: break
                
            # Decisions based on what limit we hit
            if miles_since_fuel >= 1000.0:
                self.add_log(4, 0.5, "Fueling Stop")
                miles_since_fuel = 0.0
            elif self.driving_since_break >= self.BREAK_REQUIRED_AFTER:
                self.add_log(1, 0.5, "30-min Rest Break")
                self.driving_since_break = 0.0
            elif self.cycle_total >= self.CYCLE_LIMIT:
                self.add_log(1, 34.0, "34-hour Cycle Restart")
                self.cycle_total = 0.0
            else: # Daily limits (11hr driving or 14hr on-duty window)
                self.add_log(2, 10.0, "10-hour Daily Rest")

        # 2. Drop-off (Assumption: 1 hour)
        self.add_log(4, 1.0, "Drop-off / Unloading")
        return self.logs

    def get_daily_logs(self):
        if not self.logs: return []
        all_segments = []
        for log in self.logs:
            log_start = datetime.fromisoformat(log['start_time'])
            log_duration = log['duration']
            log_end = log_start + timedelta(hours=log_duration)
            miles_per_hour = log.get('distance', 0) / log_duration if log_duration > 0 else 0
            
            temp_start = log_start
            while temp_start < log_end:
                next_midnight = (temp_start + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
                temp_end = min(log_end, next_midnight)
                segment_duration = (temp_end - temp_start).total_seconds() / 3600.0
                all_segments.append({
                    'start_time': temp_start,
                    'status': log['status'],
                    'duration': segment_duration,
                    'remark': log['remark'] if temp_start == log_start else "",
                    'miles': segment_duration * miles_per_hour,
                    'cycle_at_end': log['cycle_at_end']
                })
                temp_start = temp_end

        day_logs = {}
        for seg in all_segments:
            day_str = seg['start_time'].strftime('%Y-%m-%d')
            if day_str not in day_logs: day_logs[day_str] = []
            day_logs[day_str].append(seg)
            
        daily_sheets = []
        for day, segments in day_logs.items():
            total_miles = sum(s['miles'] for s in segments)
            total_on_duty = sum(s['duration'] for s in segments if s['status'] in [3, 4])
            daily_sheets.append({
                'date': day,
                'total_miles': round(total_miles, 1),
                'total_on_duty': round(total_on_duty, 1),
                'hours_available': round(70.0 - segments[-1]['cycle_at_end'], 1),
                'segments': [{
                    'start_hour': (s['start_time'].hour + s['start_time'].minute/60.0),
                    'status': s['status'],
                    'duration': s['duration'],
                    'remark': s['remark']
                } for s in segments]
            })
        return daily_sheets
