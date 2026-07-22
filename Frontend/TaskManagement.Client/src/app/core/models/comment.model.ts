export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  username: string;
  comment: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  comment: string;
}