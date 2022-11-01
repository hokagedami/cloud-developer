import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoAccess } from './todosAcess'
import { ParseUserId } from '../auth/utils'
import { TodoUpdate } from '../models/TodoUpdate'

// TODO: Implement businessLogic

const uuidv4 = require('uuid/v4');
const toDoAccess = new TodoAccess();

export async function GetAllTodoItems(jwtToken: string): Promise<TodoItem[]> {
  const userId = ParseUserId(jwtToken);
  return toDoAccess.GetUserToDos(userId);
}

export function CreateTodoItem(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {
  const userId = ParseUserId(jwtToken);
  const todoId =  uuidv4();
  const s3BucketName = process.env.ATTACHMENT_S3_BUCKET;

  return toDoAccess.CreateToDo({
    userId: userId,
    todoId: todoId,
    attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`,
    createdAt: new Date().getTime().toString(),
    done: false,
    ...createTodoRequest,
  });
}

export function UpdateTodoItem(updateTodoRequest: UpdateTodoRequest, todoId: string, jwtToken: string): Promise<TodoUpdate> {
  const userId = ParseUserId(jwtToken);
  return toDoAccess.UpdateToDo(updateTodoRequest, todoId, userId);
}

export function DeleteTodoItem(todoId: string, jwtToken: string): Promise<string> {
  const userId = ParseUserId(jwtToken);
  return toDoAccess.DeleteToDo(todoId, userId);
}

export function GenerateUploadUrl(todoId: string): Promise<string> {
  return toDoAccess.GenerateUploadUrl(todoId);
}
