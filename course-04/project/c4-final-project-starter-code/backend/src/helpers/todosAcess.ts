import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { Types } from 'aws-sdk/clients/s3'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3Client: Types = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET) {
  }

  async GetUserToDos(userId: string): Promise<TodoItem[]> {
    console.log("Getting all todo");
    logger.info("Getting all todo");

    const params = {
      TableName: this.todoTable,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId"
      },
      ExpressionAttributeValues: {
        ":userId": userId
      }
    };

    const result = await this.docClient.query(params).promise();
    console.log(result);
    const items = result.Items;

    return items as TodoItem[];
  }

  async CreateToDo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info("Creating new todo item ....");

    const params = {
      TableName: this.todoTable,
      Item: todoItem,
    };

    const result = await this.docClient.put(params).promise();
    logger.info("result::", result);

    return todoItem as TodoItem;
  }

  async UpdateToDo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
    logger.info("Updating todo item ....");

    const params = {
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set #a = :a, #b = :b, #c = :c",
      ExpressionAttributeNames: {
        "#a": "name",
        "#b": "dueDate",
        "#c": "done"
      },
      ExpressionAttributeValues: {
        ":a": todoUpdate['name'],
        ":b": todoUpdate['dueDate'],
        ":c": todoUpdate['done']
      },
      ReturnValues: "ALL_NEW"
    };

    const result = await this.docClient.update(params).promise();
    console.log(result);
    const attributes = result.Attributes;

    return attributes as TodoUpdate;
  }

  async DeleteToDo(todoId: string, userId: string): Promise<string> {
    logger.info("Deleting todo item ....");

    const params = {
      TableName: this.todoTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      },
    };

    const result = await this.docClient.delete(params).promise();
    logger.info("result::", result);

    return "" as string;
  }

  async GenerateUploadUrl(todoId: string): Promise<string> {
    logger.info("Generating upload url ....");

    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: 6000,
    });
    console.log(url);

    return url as string;
  }
}
