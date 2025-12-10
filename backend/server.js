// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ✅ Middleware kiểm tra email unique khi tạo/cập nhật user
server.use('/users', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const db = router.db;
    const userData = req.body;
    const email = userData.email;

    if (email) {
      // Lấy userId từ URL nếu là PUT/PATCH
      let currentUserId = null;
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const urlPath = req.url.split('?')[0];
        const urlParts = urlPath.split('/').filter(part => part);
        if (urlParts.length > 0 && urlParts[urlParts.length - 1] !== 'users') {
          currentUserId = urlParts[urlParts.length - 1];
        }
      }

      // Kiểm tra email đã tồn tại chưa (trừ user hiện tại nếu đang cập nhật)
      const existingUser = db.get('users')
        .find(u => {
          if (!u.email) return false;
          if (currentUserId && String(u.id) === String(currentUserId)) return false;
          return u.email.toLowerCase() === email.toLowerCase();
        })
        .value();

      if (existingUser) {
        return res.status(400).json({
          error: 'Email đã được sử dụng. Vui lòng sử dụng email khác.'
        });
      }
    }
  }
  next();
});

// ✅ Route xác minh email
server.get('/verify/:id', (req, res) => {
  const id = req.params.id;
  const db = router.db;

  // So sánh id dưới dạng chuỗi để tránh lỗi khi id là số trong db.json
  const user = db.get('users').find(u => String(u.id) === id).value();

  if (!user) {
    return res.status(404).send('Người dùng không tồn tại');
  }

  if (user.verified) {
    return res.send('Tài khoản đã xác minh thành công');
  }

  db.get('users')
    .find(u => String(u.id) === id)
    .assign({ verified: true })
    .write();

  res.send('Xác minh tài khoản thành công!');
});

// ✅ Middleware kiểm tra: mỗi staff chỉ quản lý 1 món (có thể có nhiều khung giờ) - cho menu
server.use('/menu', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const db = router.db;
    const menuData = req.body;
    const staffId = menuData.tutorId || menuData.staffId;
    const dishName = menuData.name;

    if (!staffId || !dishName) {
      return next(); // Let json-server handle missing fields
    }

    // Lấy tất cả món của staff này từ menu
    const menuItems = db.get('menu')
      .filter(item => String(item.tutorId || item.staffId) === String(staffId))
      .value();

    if (req.method === 'POST') {
      // Khi tạo mới: kiểm tra xem staff đã có món nào khác chưa
      if (menuItems.length > 0) {
        const existingDish = menuItems[0].name;
        if (existingDish !== dishName) {
          return res.status(400).json({
            error: 'Mỗi staff chỉ được quản lý 1 món ăn. Bạn đã có món: ' + existingDish + '. Vui lòng thêm khung giờ mới cho món này thay vì tạo món mới.'
          });
        }
      }
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Khi cập nhật: kiểm tra xem có đang đổi sang món khác không
      // Lấy menuId từ URL (ví dụ: /menu/1 hoặc /1)
      let menuId = null;
      const urlPath = req.url.split('?')[0]; // Bỏ query parameters
      const urlParts = urlPath.split('/').filter(part => part);
      
      // Tìm menuId trong URL (số hoặc chuỗi)
      for (let i = urlParts.length - 1; i >= 0; i--) {
        const part = urlParts[i];
        if (part && part !== 'menu') {
          menuId = part;
          break;
        }
      }
      
      if (menuId) {
        const otherItems = menuItems.filter(item => String(item.id) !== String(menuId));
        
        if (otherItems.length > 0) {
          const existingDish = otherItems[0].name;
          if (existingDish !== dishName) {
            return res.status(400).json({
              error: 'Mỗi staff chỉ được quản lý 1 món ăn. Bạn đã có món: ' + existingDish + '. Không thể đổi sang món khác.'
            });
          }
        }
      }
    }
  }
  next();
});

// Redirect từ tutorCourses sang menu để tương thích ngược
server.use('/tutorCourses', (req, res, next) => {
  // Redirect GET requests
  if (req.method === 'GET') {
    const db = router.db;
    const menuData = db.get('menu').value();
    return res.json(menuData);
  }
  // For other methods, redirect to /menu
  req.url = req.url.replace('/tutorCourses', '/menu');
  next();
});

// Các route mặc định
server.use(router);

// Start server
server.listen(3001, () => {
  console.log('🚀 JSON Server đang chạy tại http://localhost:3001');
});
