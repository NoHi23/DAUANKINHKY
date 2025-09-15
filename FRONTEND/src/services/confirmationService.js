import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css'; // <<-- Sửa thành dòng này

export const showConfirmDialog = ({
    title = 'Bạn có chắc chắn?',
    text = "Hành động này không thể được hoàn tác!",
    icon = 'warning',
    confirmButtonText = 'Vâng, xóa nó!',
    cancelButtonText = 'Hủy bỏ'
} = {}) => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#e74c3c', // Màu đỏ cho nút xóa
        cancelButtonColor: '#bdc3c7', // Màu xám cho nút hủy
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText
    });
};