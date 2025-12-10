import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OpenCourse.css';

const OpenCourse = () => {
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState('');
  const [learningMethod, setLearningMethod] = useState('online');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [timeSlots, setTimeSlots] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });
  const [errors, setErrors] = useState({});
  const [conflictMessage, setConflictMessage] = useState('');
  const [existingCourses, setExistingCourses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]); // Danh sách courses mẫu
  const [selectedCourseId, setSelectedCourseId] = useState(''); // ID của course được chọn

  useEffect(() => {
    // Lấy thông tin user hiện tại
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'staff') {
      navigate('/home');
      return;
    }

    setCurrentUser(user);

    // Lấy các món ăn hiện tại của staff từ menu
    const fetchExistingCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/menu');
        const menuItems = response.data.filter(
          item => (item.staffId || item.tutorId) === user.id.toString()
        );
        setExistingCourses(menuItems);
        
        // Nếu đã có món ăn, tự động điền tên món ăn
        if (menuItems.length > 0) {
          setSubjectName(menuItems[0].name);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };

    // Lấy danh sách courses mẫu để tutor có thể chọn
    const fetchAvailableCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/courses');
        // Lấy danh sách tên môn học duy nhất
        const uniqueSubjects = [];
        const seenNames = new Set();
        
        response.data.forEach(course => {
          if (!seenNames.has(course.name)) {
            seenNames.add(course.name);
            uniqueSubjects.push({
              id: course.id,
              name: course.name
            });
          }
        });
        
        setAvailableCourses(uniqueSubjects);
      } catch (error) {
        console.error('Error fetching available courses:', error);
      }
    };

    fetchExistingCourses();
    // Chỉ fetch courses mẫu nếu chưa có môn học
    fetchAvailableCourses();
  }, [navigate]);

  const handleDayToggle = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));

    // Nếu bỏ chọn ngày, xóa tất cả time slots của ngày đó
    if (selectedDays[day]) {
      setTimeSlots(prev => ({
        ...prev,
        [day]: []
      }));
    }
  };

  const addTimeSlot = (day) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: [...prev[day], { start: '07:00', end: '09:00' }]
    }));
  };

  const removeTimeSlot = (day, index) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    setTimeSlots(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Kiểm tra trùng lịch
  const checkScheduleConflict = () => {
    if (!startDate || !endDate) return [];

    const conflicts = [];

    existingCourses.forEach(course => {
      if (!course.openTime) return;

      // Parse openTime từ course hiện tại
      const courseSchedule = parseOpenTime(course.openTime);
      
      // Kiểm tra từng ngày và time slot mới
      Object.keys(selectedDays).forEach(day => {
        if (!selectedDays[day]) return;

        const dayNumber = getDayNumber(day);
        const newTimeSlots = timeSlots[day];

        newTimeSlots.forEach(newSlot => {
          courseSchedule.forEach(courseSlot => {
            if (courseSlot.day === dayNumber) {
              // Kiểm tra overlap thời gian
              const newStart24 = convertTo24Hour(newSlot.start);
              const newEnd24 = convertTo24Hour(newSlot.end);
              
              if (isTimeOverlap(
                newStart24,
                newEnd24,
                courseSlot.startTime,
                courseSlot.endTime
              )) {
                // Kiểm tra overlap ngày (nếu không có ngày trong course, coi như có overlap)
                const courseStartDate = course.startDate || '';
                const courseEndDate = course.endDate || '';
                
                // Nếu course không có ngày hoặc có overlap ngày
                if (!courseStartDate || !courseEndDate || isDateRangeOverlap(
                  startDate,
                  endDate,
                  courseStartDate,
                  courseEndDate
                )) {
                  conflicts.push({
                    courseName: course.name,
                    day: getDayName(dayNumber),
                    time: `${formatTimeDisplay(courseSlot.startTime)} - ${formatTimeDisplay(courseSlot.endTime)}`,
                    newTime: `${formatTimeDisplay(newStart24)} - ${formatTimeDisplay(newEnd24)}`
                  });
                }
              }
            }
          });
        });
      });
    });

    return conflicts;
  };

  const formatTimeDisplay = (time) => {
    // Convert "07:00" to "7:00 AM" for display
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    if (hour === 0) return `12:${minutes || '00'} AM`;
    if (hour < 12) return `${hour}:${minutes || '00'} AM`;
    if (hour === 12) return `12:${minutes || '00'} PM`;
    return `${hour - 12}:${minutes || '00'} PM`;
  };

  const parseOpenTime = (openTime) => {
    // Format: "Thứ 2, 4, 6 - 7:00-9:00" hoặc "Thứ 2 - 7:00-9:00"
    if (!openTime) return [];
    
    const parts = openTime.split(' - ');
    if (parts.length < 2) return [];

    const daysPart = parts[0].replace('Thứ ', '').trim();
    const timePart = parts[1].trim();
    const [startTime, endTime] = timePart.split('-').map(t => t.trim());

    return daysPart.split(',').map(d => {
      const dayStr = d.trim();
      // Xử lý "Chủ nhật" = 1, "Thứ 2" = 2, etc.
      let dayNumber;
      if (dayStr === 'Chủ nhật' || dayStr === 'CN') {
        dayNumber = 1;
      } else {
        dayNumber = parseInt(dayStr) || 0;
      }
      
      return {
        day: dayNumber,
        startTime: convertTo24Hour(startTime),
        endTime: convertTo24Hour(endTime)
      };
    }).filter(item => item.day > 0);
  };

  const convertTo24Hour = (time) => {
    // Convert "7:00 AM" to "07:00" or "7:00" to "07:00" or "07:00" to "07:00"
    if (!time) return '00:00';
    
    // Nếu đã là format 24h (có dấu : và không có AM/PM)
    if (!time.includes('AM') && !time.includes('PM')) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes || '00'}`;
    }
    
    // Convert từ 12h format
    const parts = time.split(' ');
    if (parts.length < 2) return time;
    
    const [timePart, period] = parts;
    const [hour, minute] = timePart.split(':');
    let hour24 = parseInt(hour);
    
    if (period.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute || '00'}`;
  };

  const getDayNumber = (day) => {
    const dayMap = {
      monday: 2,
      tuesday: 3,
      wednesday: 4,
      thursday: 5,
      friday: 6,
      saturday: 7,
      sunday: 1
    };
    return dayMap[day];
  };

  const getDayName = (dayNumber) => {
    const dayNames = {
      1: 'Chủ nhật',
      2: 'Thứ 2',
      3: 'Thứ 3',
      4: 'Thứ 4',
      5: 'Thứ 5',
      6: 'Thứ 6',
      7: 'Thứ 7'
    };
    return dayNames[dayNumber] || '';
  };

  const isTimeOverlap = (start1, end1, start2, end2) => {
    const time1Start = timeToMinutes(start1);
    const time1End = timeToMinutes(end1);
    const time2Start = timeToMinutes(start2);
    const time2End = timeToMinutes(end2);

    return (time1Start < time2End && time1End > time2Start);
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const isDateRangeOverlap = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return true; // Nếu không có ngày, coi như overlap
    const d1Start = new Date(start1);
    const d1End = new Date(end1);
    const d2Start = new Date(start2);
    const d2End = new Date(end2);

    return (d1Start <= d2End && d1End >= d2Start);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!subjectName.trim()) {
      newErrors.subjectName = 'Vui lòng nhập tên môn học';
    }

    if (!startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    const hasSelectedDay = Object.values(selectedDays).some(selected => selected);
    if (!hasSelectedDay) {
      newErrors.days = 'Vui lòng chọn ít nhất một ngày trong tuần';
    }

    // Kiểm tra mỗi ngày đã chọn phải có ít nhất 1 time slot
    Object.keys(selectedDays).forEach(day => {
      if (selectedDays[day] && timeSlots[day].length === 0) {
        newErrors[`timeSlot_${day}`] = `Vui lòng thêm ít nhất một khung giờ cho ${getDayName(getDayNumber(day))}`;
      }
    });

    // Kiểm tra time slots hợp lệ
    Object.keys(timeSlots).forEach(day => {
      timeSlots[day].forEach((slot, index) => {
        if (timeToMinutes(slot.start) >= timeToMinutes(slot.end)) {
          newErrors[`timeSlot_${day}_${index}`] = 'Giờ kết thúc phải sau giờ bắt đầu';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictMessage('');

    if (!validateForm()) {
      return;
    }

    // Kiểm tra trùng lịch
    const conflicts = checkScheduleConflict();
    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c => 
        `- ${c.courseName}: ${c.day} (${c.time})`
      ).join('\n');
      setConflictMessage(
        `⚠️ Trùng lịch với các môn học hiện tại:\n${conflictDetails}\n\nVui lòng chọn khung giờ khác.`
      );
      return;
    }

    try {
      // Nhóm các ngày có cùng khung giờ lại với nhau
      const timeSlotGroups = {}; // Key: "7:00-9:00", Value: [{day: 'monday', dayNumber: 2, dayName: 'Thứ 2'}, ...]

      Object.keys(selectedDays).forEach(day => {
        if (!selectedDays[day]) return;

        const dayNumber = getDayNumber(day);
        const dayName = getDayName(dayNumber);
        const slots = timeSlots[day];

        slots.forEach(slot => {
          const timeStr = `${formatTime(slot.start)}-${formatTime(slot.end)}`;
          
          if (!timeSlotGroups[timeStr]) {
            timeSlotGroups[timeStr] = [];
          }
          
          timeSlotGroups[timeStr].push({
            day: day,
            dayNumber: dayNumber,
            dayName: dayName
          });
        });
      });

      // Tạo courses cho mỗi nhóm khung giờ
      const coursesToCreate = [];

      Object.keys(timeSlotGroups).forEach(timeStr => {
        const daysInGroup = timeSlotGroups[timeStr];
        
        // Sắp xếp các ngày theo thứ tự (2, 3, 4, 5, 6, 7, CN)
        daysInGroup.sort((a, b) => {
          // Chủ nhật (1) nên đứng cuối
          if (a.dayNumber === 1) return 1;
          if (b.dayNumber === 1) return -1;
          return a.dayNumber - b.dayNumber;
        });

        // Tạo chuỗi ngày: "Thứ 2, 4, 6" hoặc "Chủ nhật" hoặc "Thứ 2, CN"
        const dayParts = daysInGroup.map(d => {
          if (d.dayNumber === 1) return 'CN';
          return d.dayNumber.toString();
        });
        
        // Nếu có Chủ nhật và các ngày khác, đặt Chủ nhật ở cuối
        const hasSunday = dayParts.includes('CN');
        const otherDays = dayParts.filter(d => d !== 'CN');
        const sortedDays = hasSunday ? [...otherDays, 'CN'] : otherDays;
        
        // Nếu chỉ có Chủ nhật, dùng "Chủ nhật", ngược lại dùng "Thứ X, Y, CN"
        const dayNamesStr = sortedDays.length === 1 && sortedDays[0] === 'CN' 
          ? 'Chủ nhật' 
          : `Thứ ${sortedDays.join(', ')}`;
        const openTime = `${dayNamesStr} - ${timeStr}`;

        coursesToCreate.push({
          name: subjectName,
          tutorId: currentUser.id.toString(),
          openTime: openTime,
          startDate: startDate,
          endDate: endDate,
          learningMethod: learningMethod,
          status: 'Còn trống',
          rating: 0,
          image: 'images/courses/default.png',
          category: '',
          location: '',
          address: '',
          phone: currentUser.phone || '',
          restname: currentUser.name || currentUser.username || '',
          prepareTime: 0,
          serviceFee: 0,
          note: '',
          tag: [],
          // Thêm các trường bổ sung
          createdAt: new Date().toISOString()
        });
      });

      // Tạo từng course vào tutorCourses
      for (const courseData of coursesToCreate) {
        await axios.post('http://localhost:3001/tutorCourses', courseData);
      }

      alert('✅ Đã thêm món ăn thành công!');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data?.error || 'Có lỗi xảy ra khi thêm món ăn';
      alert(`❌ ${errorMessage}`);
    }
  };

  const formatTime = (time) => {
    // Convert "07:00" to "7:00" for display
    const [hours, minutes] = time.split(':');
    return `${parseInt(hours)}:${minutes || '00'}`;
  };

  const dayLabels = {
    monday: 'Thứ 2',
    tuesday: 'Thứ 3',
    wednesday: 'Thứ 4',
    thursday: 'Thứ 5',
    friday: 'Thứ 6',
    saturday: 'Thứ 7',
    sunday: 'Chủ nhật'
  };

  return (
    <Container className="open-course-container">
      <h2 className="mb-4">Thêm món ăn mới</h2>

      {existingCourses.length > 0 && (
        <Alert variant="info" className="mb-3">
          <strong>Lưu ý:</strong> Bạn đã có món ăn "{existingCourses[0].name}". 
          Bạn chỉ có thể thêm khung giờ phục vụ mới cho món ăn này.
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Tên món ăn */}
        <Form.Group className="mb-3">
          <Form.Label>Tên món ăn (*)</Form.Label>
          {existingCourses.length === 0 ? (
            // Nếu chưa có môn học: hiển thị dropdown để chọn từ courses mẫu
            <>
              <Form.Select
                value={selectedCourseId}
                onChange={(e) => {
                  const courseId = e.target.value;
                  setSelectedCourseId(courseId);
                  const selectedCourse = availableCourses.find(c => c.id === courseId);
                  if (selectedCourse) {
                    setSubjectName(selectedCourse.name);
                  } else {
                    setSubjectName('');
                  }
                }}
                isInvalid={!!errors.subjectName}
              >
                <option value="">-- Chọn món ăn từ danh sách --</option>
                {availableCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Hoặc bạn có thể nhập tên món ăn mới bên dưới
              </Form.Text>
              <Form.Control
                type="text"
                value={subjectName}
                onChange={(e) => {
                  setSubjectName(e.target.value);
                  setSelectedCourseId(''); // Reset dropdown khi nhập tay
                }}
                placeholder="Hoặc nhập tên món ăn mới"
                className="mt-2"
                isInvalid={!!errors.subjectName}
              />
            </>
          ) : (
            // Nếu đã có môn học: chỉ hiển thị input disabled
            <Form.Control
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Nhập tên món ăn"
              isInvalid={!!errors.subjectName}
              disabled={true}
            />
          )}
          <Form.Control.Feedback type="invalid">
            {errors.subjectName}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Hình thức phục vụ */}
        <Form.Group className="mb-3">
          <Form.Label>Hình thức phục vụ:</Form.Label>
          <div>
            <Form.Check
              inline
              type="radio"
              label="Giao hàng"
              name="learningMethod"
              value="online"
              checked={learningMethod === 'online'}
              onChange={(e) => setLearningMethod(e.target.value)}
            />
            <Form.Check
              inline
              type="radio"
              label="Tại nhà hàng"
              name="learningMethod"
              value="offline"
              checked={learningMethod === 'offline'}
              onChange={(e) => setLearningMethod(e.target.value)}
            />
          </div>
        </Form.Group>

        {/* Ngày bắt đầu và kết thúc */}
        <div className="row mb-3">
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Ngày bắt đầu phục vụ (*)</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                isInvalid={!!errors.startDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.startDate}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Ngày kết thúc phục vụ (*)</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                isInvalid={!!errors.endDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.endDate}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        </div>

        {/* Chọn ngày trong tuần */}
        <Form.Group className="mb-3">
          <Form.Label>Chọn ngày trong tuần (*)</Form.Label>
          <div className="d-flex flex-wrap gap-3">
            {Object.keys(dayLabels).map(day => (
              <Form.Check
                key={day}
                type="checkbox"
                label={dayLabels[day]}
                checked={selectedDays[day]}
                onChange={() => handleDayToggle(day)}
              />
            ))}
          </div>
          {errors.days && (
            <div className="text-danger mt-2">{errors.days}</div>
          )}
        </Form.Group>

        {/* Time slots cho từng ngày */}
        {Object.keys(dayLabels).map(day => {
          if (!selectedDays[day]) return null;

          return (
            <div key={day} className="mb-4 p-3 border rounded">
              <Form.Label className="fw-bold">
                Thời gian phục vụ {dayLabels[day]}:
              </Form.Label>
              
              {timeSlots[day].map((slot, index) => (
                <div key={index} className="d-flex align-items-center gap-2 mb-2">
                  <Form.Control
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                    className="flex-shrink-0"
                    style={{ width: '150px' }}
                  />
                  <span>-</span>
                  <Form.Control
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                    className="flex-shrink-0"
                    style={{ width: '150px' }}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeTimeSlot(day, index)}
                  >
                    ✕
                  </Button>
                  {errors[`timeSlot_${day}_${index}`] && (
                    <span className="text-danger small">
                      {errors[`timeSlot_${day}_${index}`]}
                    </span>
                  )}
                </div>
              ))}

              {errors[`timeSlot_${day}`] && (
                <div className="text-danger mb-2">{errors[`timeSlot_${day}`]}</div>
              )}

              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => addTimeSlot(day)}
                className="mt-2"
              >
                + Thêm khung giờ
              </Button>
            </div>
          );
        })}

        {/* Thông báo trùng lịch */}
        {conflictMessage && (
          <Alert variant="warning" className="mt-3">
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>
              {conflictMessage}
            </pre>
          </Alert>
        )}

        {/* Kiểm tra trùng lịch real-time khi có đủ thông tin */}
        {startDate && endDate && Object.values(selectedDays).some(d => d) && 
         Object.values(timeSlots).some(slots => slots.length > 0) && 
         (() => {
           const conflicts = checkScheduleConflict();
           if (conflicts.length > 0) {
             const conflictDetails = conflicts.map(c => 
               `- ${c.courseName}: ${c.day} (${c.time})`
             ).join('\n');
             return (
               <Alert variant="warning" className="mt-3">
                 <strong>⚠️ Cảnh báo trùng lịch:</strong>
                 <pre style={{ whiteSpace: 'pre-wrap', margin: '0.5rem 0 0 0', fontFamily: 'inherit' }}>
                   {conflictDetails}
                 </pre>
               </Alert>
             );
           }
           return null;
         })()}

        {/* Nút xác nhận */}
        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => navigate('/my-orders')}
          >
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            XÁC NHẬN
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default OpenCourse;

