# Backend API 

Đây là API backend cho BTL_Database sử dụng json-server để mô phỏng REST API.

## Giới thiệu

Backend này sử dụng [json-server](https://github.com/typicode/json-server) để nhanh chóng tạo một REST API giả lập từ file db.json. Hệ thống này phù hợp cho môi trường phát triển và thử nghiệm.

## Cài đặt

1. Cài đặt json-server (nếu chưa có):

```bash
npm install -g json-server
```

2. Đảm bảo rằng bạn đã cài đặt các dependencies:

```bash
npm install
```

## Sử dụng

Để khởi động server ở chế độ phát triển:

```bash
npx json-server --watch db.json --port 3001
```

Server sẽ chạy tại địa chỉ: [http://localhost:3001](http://localhost:3001)

## Các endpoint

Backend cung cấp các endpoint sau:

- `GET /users` - Lấy danh sách người dùng
- `GET /users/:id` - Lấy thông tin người dùng theo ID
- `POST /users` - Tạo người dùng mới
- `PUT /users/:id` - Cập nhật thông tin người dùng
- `DELETE /users/:id` - Xóa người dùng

- `GET /requests` - Lấy danh sách yêu cầu
- `GET /requests/:id` - Lấy thông tin yêu cầu theo ID
- `POST /requests` - Tạo yêu cầu mới
- `PUT /requests/:id` - Cập nhật thông tin yêu cầu
- `DELETE /requests/:id` - Xóa yêu cầu

- `GET /verify/:id` - Xác minh email người dùng theo ID

## Cấu trúc dữ liệu

File `db.json` chứa cơ sở dữ liệu giả lập với các bảng:
- `users`: Thông tin người dùng
- `requests`: Yêu cầu trở thành tutor

## Chú ý

File `server.js` cung cấp cấu hình nâng cao cho server và được thiết kế để sử dụng khi triển khai lên môi trường production. Trong quá trình phát triển, chỉ cần sử dụng lệnh json-server như đã nêu ở trên.
