# Online Consultation System - Testing Guide

## Quick Start Testing

### 1. Fix Current Issues ✅

All major errors have been resolved:
- ✅ WebRTCService constructor error fixed
- ✅ MUI color errors resolved  
- ✅ Function initialization order fixed
- ✅ Real-time notification system integrated
- ✅ Hospital information integrated

### 2. Test the System

#### Doctor Interface Testing
1. **Access Doctor Dashboard**:
   ```
   Navigate to: /doctor/online-appointments
   ```

2. **Test Online Status**:
   - Toggle the online/offline switch
   - Watch for connection status indicator
   - Verify socket connection badge

3. **View Patient Queue**:
   - Check "Waiting Patients" tab
   - View patient information including hospital data
   - Test "Start Consultation" buttons

4. **Test Video Calls**:
   - Click "Start Consultation" on any waiting patient
   - Verify video call interface opens
   - Test video/audio controls
   - Test chat functionality
   - Test call ending

#### Patient Interface Testing
1. **Access Patient Dashboard**:
   ```
   Navigate to: /patient/online-consultation
   ```

2. **View Available Doctors**:
   - See list of online/offline doctors
   - View doctor details including hospital information
   - Check specializations and ratings

3. **Test Instant Calls**:
   - Click "Call Now" on online doctors
   - Verify outgoing call is initiated
   - Test call acceptance/rejection

4. **Test Scheduling**:
   - Click "Schedule" on offline doctors
   - Fill consultation request form
   - Submit scheduling request

### 3. Real-time Features Testing

#### Notification System
1. **Connection Status**:
   - Watch connection indicators in both interfaces
   - Test reconnection when server restarts

2. **Call Notifications**:
   - Initiate call from patient → verify doctor receives notification
   - Accept/reject calls and verify status updates
   - Test browser notifications (if permissions granted)

3. **Status Updates**:
   - Toggle doctor online status → verify patient sees updates
   - Test real-time availability changes

#### WebRTC Video Calls
1. **Call Initiation**:
   - Start call from either party
   - Verify signaling works correctly
   - Check video/audio streams

2. **Call Controls**:
   - Test mute/unmute audio
   - Test enable/disable video
   - Test chat during call
   - Test call ending from both sides

3. **Connection Quality**:
   - Test in different network conditions
   - Verify reconnection attempts
   - Check fallback mechanisms

## Backend API Requirements

The frontend expects these endpoints to work with real data:

### Doctor Endpoints
```javascript
// Get doctor's consultations
GET /api/consultations/doctor/:doctorId

// Get waiting patients for doctor
GET /api/consultations/waiting/:doctorId

// Update doctor online status
PATCH /api/doctors/online-status
Body: { isOnline: boolean }

// Alternative combined endpoint
GET /api/consultations/doctor/:doctorId/all
```

### Patient Endpoints
```javascript
// Get online doctors
GET /api/doctors/online

// Get patient's consultations
GET /api/consultations/patient/:patientId

// Request consultation
POST /api/consultations/request
Body: { doctorId, patientId, reason, type }
```

### Socket.IO Events
```javascript
// Server should handle these events:
'join-user-room' - User joins their notification room
'call-request' - Outgoing call request
'call-accepted' - Call accepted
'call-rejected' - Call rejected  
'call-ended' - Call ended
'update-online-status' - Online status change

// Server should emit these events:
'incoming-call' - Incoming call notification
'call-accepted' - Call was accepted
'call-rejected' - Call was rejected
'call-ended' - Call ended by other party
'doctor-online' - Doctor came online
'appointment-reminder' - Appointment reminders
```

## Mock Data Features

When backend is not available, the system uses comprehensive mock data:

### Doctor Mock Data
- **Consultations**: Scheduled appointments with patient details
- **Waiting Patients**: Queue of patients wanting consultations
- **Patient Information**: Names, conditions, priorities, hospital affiliations

### Patient Mock Data  
- **Available Doctors**: Online/offline doctors with specializations
- **Hospital Information**: Doctor hospital affiliations and contact details
- **Ratings & Reviews**: Doctor ratings and patient feedback
- **Consultation History**: Past appointments and upcoming bookings

## Development Environment Setup

### 1. Environment Variables
Create `.env` file:
```env
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
```

### 2. Browser Requirements
- **Chrome/Chromium**: Recommended for full WebRTC support
- **HTTPS**: Required for camera/microphone access in production
- **Permissions**: Camera, microphone, and notification permissions

### 3. Network Requirements
- **WebSocket Connection**: For real-time notifications
- **STUN Server Access**: For WebRTC peer connections
- **Media Device Access**: Camera and microphone permissions

## Debugging Tips

### 1. Console Logs
Monitor browser console for:
- WebRTC service initialization
- Socket connection status
- API call success/failures
- Call signaling messages

### 2. Network Tab
Check for:
- API endpoint responses
- WebSocket connection establishment
- Media stream negotiations

### 3. WebRTC Internals
Access `chrome://webrtc-internals` for:
- Peer connection status
- ICE candidate exchanges
- Media stream statistics

## Common Issues & Solutions

### 1. Video Not Working
**Problem**: Camera not accessible
**Solutions**:
- Check browser permissions
- Ensure HTTPS in production
- Verify WebRTC support

### 2. Calls Not Connecting
**Problem**: WebRTC connection fails
**Solutions**:
- Check STUN server configuration
- Verify network connectivity
- Test in different browsers

### 3. Notifications Not Showing
**Problem**: No real-time updates
**Solutions**:
- Check Socket.IO connection
- Verify notification permissions
- Test WebSocket server

### 4. Backend Integration Issues
**Problem**: API calls failing
**Solutions**:
- Verify API endpoints exist
- Check authentication tokens
- Review CORS configuration
- Monitor network requests

## Production Deployment

### 1. Security Requirements
- **HTTPS**: Required for WebRTC
- **Authentication**: Secure token management
- **CORS**: Proper cross-origin configuration
- **CSP**: Content Security Policy setup

### 2. Performance Optimization
- **Code Splitting**: Lazy load video components
- **Bundle Size**: Optimize WebRTC libraries
- **Caching**: Cache static assets
- **CDN**: Use CDN for media delivery

### 3. Monitoring
- **Error Tracking**: Monitor WebRTC failures
- **Analytics**: Track call success rates
- **Performance**: Monitor connection quality
- **Alerts**: Set up downtime alerts

## Testing Checklist

- [ ] Doctor can toggle online status
- [ ] Patient can see doctor availability
- [ ] Video calls can be initiated
- [ ] Audio/video controls work
- [ ] Chat functions during calls
- [ ] Calls can be ended properly
- [ ] Notifications show in real-time
- [ ] Browser notifications work
- [ ] Connection status indicators accurate
- [ ] Hospital information displays
- [ ] Mock data works when backend offline
- [ ] Real backend integration works
- [ ] Mobile responsive design
- [ ] Cross-browser compatibility
- [ ] Error handling graceful

## Next Steps

1. **Complete Backend Integration**: Implement all required API endpoints
2. **Add Call Recording**: Implement call recording functionality  
3. **Mobile App**: Extend to mobile platforms
4. **Advanced Features**: Screen sharing, file transfer, group calls
5. **Analytics**: Call quality metrics and reporting
6. **Security**: End-to-end encryption, access controls
7. **Scalability**: Load balancing, media servers

---

**Status**: ✅ System is now ready for testing with both mock data and real backend integration!