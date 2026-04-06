import { SlotGroup } from '../components/common/DateSlotPicker/DateSlotPicker'

export const DEFAULT_SLOT_GROUPS: SlotGroup[] = [  
  {
    "label": "Morning",
    "range": "09:00-12:00",
    "slots": [
      {
        "start_time": "09:00",
        "end_time": "09:15",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "09:15",
        "end_time": "09:30",
        "status": "OCCUPIED",
        "is_enabled": true,
        "is_booked": true,
        "can_toggle": false
      },
      {
        "start_time": "09:30",
        "end_time": "09:45",
        "status": "BLOCKED",
        "is_enabled": false,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "09:45",
        "end_time": "10:00",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "10:00",
        "end_time": "10:15",
        "status": "OCCUPIED",
        "is_enabled": true,
        "is_booked": true,
        "can_toggle": false
      },
      {
        "start_time": "10:15",
        "end_time": "10:30",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "10:30",
        "end_time": "10:45",
        "status": "BLOCKED",
        "is_enabled": false,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "10:45",
        "end_time": "11:00",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "11:00",
        "end_time": "11:15",
        "status": "OCCUPIED",
        "is_enabled": true,
        "is_booked": true,
        "can_toggle": false
      },
      {
        "start_time": "11:15",
        "end_time": "11:30",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "11:30",
        "end_time": "11:45",
        "status": "BLOCKED",
        "is_enabled": false,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "11:45",
        "end_time": "12:00",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      }
    ]
  },
  {
    "label": "Afternoon",
    "range": "12:00-15:00",
    "slots": [
      {
        "start_time": "12:00",
        "end_time": "12:15",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "12:15",
        "end_time": "12:30",
        "status": "OCCUPIED",
        "is_enabled": true,
        "is_booked": true,
        "can_toggle": false
      },
      {
        "start_time": "12:30",
        "end_time": "12:45",
        "status": "AVAILABLE",
        "is_enabled": true,
        "is_booked": false,
        "can_toggle": true
      },
      {
        "start_time": "12:45",
        "end_time": "13:00",
        "status": "BLOCKED",
        "is_enabled": false,
        "is_booked": false,
        "can_toggle": true
      }
    ]
  }
]
