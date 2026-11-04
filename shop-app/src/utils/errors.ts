export function authErrorMessage(e: any): string {
  switch (e?.code) {
    case 'auth/invalid-email':
      return 'Email không hợp lệ';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email hoặc mật khẩu không đúng';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký';
    case 'auth/weak-password':
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng';
    case 'auth/too-many-requests':
      return 'Thử quá nhiều lần, vui lòng thử lại sau';
    default:
      return e?.message ?? 'Đã có lỗi xảy ra';
  }
}