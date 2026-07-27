---
title: Di cư Server
lang: vi
permalink: /vi/lands-of-jail/events/server-migration/
ref: loj-event-server-migration
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# Lands of Jail - Di cư Server

## Tổng quan

Sự kiện di cư gồm **3 giai đoạn**:

1. Chuẩn bị
2. Lời mời
3. Di cư mở

Dùng hướng dẫn này để biết ai có thể tự di cư, ai cần lời mời, và những điều kiện nào có thể chặn quá trình di cư.

## Giai đoạn 1: Chuẩn bị

- President trở thành **Quản trị viên Di cư**.
- Có thể chuyển quyền quản trị **chỉ trong Giai đoạn 1**.
- Quản trị viên thiết lập **giới hạn sức mạnh di cư**.
- Người vượt giới hạn sẽ không thể tự do di cư ở Giai đoạn 3.

## Giai đoạn 2: Lời mời

### Lời mời Cơ bản

- Dành cho người **không vượt giới hạn sức mạnh**.
- Mỗi server có số lượng lời mời cơ bản giới hạn.

### Lời mời Ưu tú

- Dành cho người **vượt giới hạn sức mạnh**.
- Mỗi server có tối đa **3 Elite Invite**.
- Mỗi tháng hồi **1 lượt vào ngày 1 lúc 00:00 theo giờ server**.
- Có thể tích lũy tối đa 3 lượt.

### Elite Migration Apply

- Nếu server đích **không phải Top Server**, người vượt giới hạn có thể nộp đơn xin Elite Migration.
- Sau khi Quản trị viên phê duyệt, người chơi có thể di cư.

### Quy định Top Server

- Top Server **không được gửi Elite Invite**.
- Top Server không nhận đơn Elite Migration của người vượt giới hạn.
- Nếu server đứng đầu **3 lần liên tiếp**, server đó nhận thêm **1 Elite Invite**.

## Giai đoạn 3: Di cư mở

- Người đáp ứng giới hạn sức mạnh có thể tự di cư nếu còn chỗ.
- Ví dụ trạng thái trong ảnh:
  - Free Migration: 15/15, đã đầy
  - Basic Migration: 25/25, đã đầy
  - Elite Migration: 3 suất

## Điều kiện di cư

1. Không vượt giới hạn sức mạnh.
2. Văn phòng đạt cấp yêu cầu.
3. Server không trong trạng thái chiến đấu.
4. Không có quân đang xuất chinh.
5. Không ở trong liên minh.
6. Không phải President.
7. Đã qua ít nhất 25 ngày kể từ lần di cư gần nhất.
8. Có dưới 4 nhân vật trên server đích.

## Cách tính sức mạnh di cư

Sức mạnh di cư bao gồm:

- Văn phòng
- Bộ sưu tập
- Sách Kinh điển
- Anh hùng
- Trang bị Anh hùng
- Giáp xe
- Thương binh
- Quân dự bị

## Lưu ý

- Elite Migration không tính vào hạn mức Free Migration.
- Tài nguyên vượt sức chứa kho sẽ bị xóa khi di cư.
- Giới hạn sức mạnh trong ví dụ là **<=160,000,000**.

## Tóm tắt nhanh

| Hình thức | Đối tượng | Cần lời mời |
| --- | --- | --- |
| Free Migration | Dưới giới hạn sức mạnh | Không |
| Basic Invite | Dưới giới hạn sức mạnh | Có |
| Elite Invite | Vượt giới hạn sức mạnh | Có |
| Elite Apply | Vượt giới hạn sức mạnh | Nộp đơn |

## Ảnh tham khảo

{% assign migration_images = "4137.jpg,4138.jpg,4139.jpg,4140.jpg,4141.jpg,4142.jpg,4143.jpg,4144.jpg" | split: "," %}
{% for image in migration_images %}
![Ảnh Di cư Server {{ forloop.index }}](/events/lands-of-jail/server-migration/{{ image }})
{% endfor %}
