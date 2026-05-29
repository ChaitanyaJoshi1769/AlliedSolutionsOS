export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    organizationId?: string;
    roles: string[];
  };
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class ForgotPasswordDto {
  email: string;
  tenantId: string;
}

export class ResetPasswordDto {
  token: string;
  newPassword: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
