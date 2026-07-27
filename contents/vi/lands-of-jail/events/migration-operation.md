---
title: Di cư Giám ngục
lang: vi
permalink: /vi/lands-of-jail/events/migration-operation/
ref: loj-event-migration-operation
sidebar:
  nav: loj-vi
aside:
  toc: true
---

# {% include term.html key="lands_of_jail" %} - {% include term.html key="migration_operation" %}

## Tổng quan

{% include term.html key="migration_operation" %} gồm **3 giai đoạn**:

1. Chuẩn bị
2. Lời mời
3. Di cư mở

Dùng hướng dẫn này để biết ai có thể tự di cư, ai cần lời mời, và những điều kiện nào có thể chặn quá trình di cư.

## Giai đoạn 1: Chuẩn bị

- President trở thành **Quản trị viên Di cư**.
- Có thể chuyển quyền quản trị **chỉ trong Giai đoạn 1**.
- Quản trị viên thiết lập **giới hạn {% include term.html key="migration_score" %}**.
- Người vượt giới hạn sẽ không thể tự do di cư ở Giai đoạn 3.

## Giai đoạn 2: Lời mời

### {% include term.html key="basic_invite" %}

- Dành cho người **không vượt giới hạn {% include term.html key="migration_score" %}**.
- Mỗi server có số lượng lời mời cơ bản giới hạn.

### {% include term.html key="elite_invite" %}

- Dành cho người **vượt giới hạn {% include term.html key="migration_score" %}**.
- Mỗi server có tối đa **3 {% include term.html key="elite_invites" %}**.
- Mỗi tháng hồi **1 lượt vào ngày 1 lúc 00:00 theo giờ server**.
- Có thể tích lũy tối đa 3 lượt.

### {% include term.html key="elite_migration_application" %}

- Nếu server đích **không phải Top Server**, người vượt giới hạn {% include term.html key="migration_score" %} có thể nộp đơn **{% include term.html key="elite_migration" %}**.
- Sau khi Quản trị viên phê duyệt, người chơi có thể di cư.

### Quy định Top Server

- Top Server **không được gửi {% include term.html key="elite_invites" %}**.
- Top Server không nhận đơn {% include term.html key="elite_migration" %} của người vượt giới hạn {% include term.html key="migration_score" %}.
- Nếu server đứng đầu **3 lần liên tiếp**, server đó nhận thêm **1 {% include term.html key="elite_invite" %}**.

## Giai đoạn 3: Di cư mở

- Người đáp ứng giới hạn {% include term.html key="migration_score" %} có thể tự di cư nếu còn chỗ.
- Ví dụ trạng thái trong ảnh:
  - {% include term.html key="free_migration" %}: 15/15, đã đầy
  - {% include term.html key="basic_migration" %}: 25/25, đã đầy
  - {% include term.html key="elite_migration" %}: 3 suất

## Điều kiện di cư

1. Không vượt giới hạn {% include term.html key="migration_score" %}.
2. Văn phòng đạt cấp yêu cầu.
3. Server không trong trạng thái chiến đấu.
4. Không có quân đang xuất chinh.
5. Không ở trong liên minh.
6. Không phải President.
7. Đã qua ít nhất 25 ngày kể từ lần di cư gần nhất.
8. Có dưới 4 nhân vật trên server đích.

## Chi phí Di cư

Lần di cư này cần tiêu hao {% include term.html key="migration_pass" %}. Số lượng tiêu hao phụ thuộc vào {% include term.html key="migration_score" %} của Giám ngục.

{% include term.html key="migration_score" %} càng cao so với giá trị tiêu chuẩn của máy chủ trong phạm vi, số lượng {% include term.html key="migration_pass" %} tiêu hao càng nhiều.

{% include term.html key="migration_score" %} là giá trị lượng hóa mức độ sức mạnh chiến đấu của Giám ngục, được tính toán dựa trên:

- Cấp độ văn phòng
- Bộ sưu tập
- Sách Kinh điển
- Sức mạnh anh hùng
- Sức mạnh trang bị anh hùng
- Sức mạnh áo giáp kẻ xấu

## Lưu ý

- Di cư tinh anh không tính vào số lượng Giám ngục di cư và không bị giới hạn bởi {% include term.html key="migration_score" %} của hệ thống.
- Tài nguyên vượt sức chứa kho sẽ bị xóa khi di cư.
- Giới hạn {% include term.html key="migration_score" %} trong ví dụ là **<=160,000,000**.

## Tóm tắt nhanh

| Hình thức | Đối tượng | Cần lời mời |
| --- | --- | --- |
| {% include term.html key="free_migration" %} | Dưới giới hạn {% include term.html key="migration_score" %} | Không |
| {% include term.html key="basic_migration" %} | Dưới giới hạn {% include term.html key="migration_score" %} | Có |
| {% include term.html key="elite_migration" %} | Vượt giới hạn {% include term.html key="migration_score" %} | Có |

## Ảnh tham khảo

{% assign migration_images = "4137.jpg,4138.jpg,4139.jpg,4140.jpg,4141.jpg,4142.jpg,4143.jpg,4144.jpg" | split: "," %}
{% for image in migration_images %}
![Ảnh {% include term.html key="migration_operation" %} {{ forloop.index }}](/assets/images/lands-of-jail/events/migration-operation/{{ image }})
{% endfor %}
