import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'todos',
  timestamps: true,
});

export interface Todo {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  user?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TodoModel = mongoose.models.Todo || mongoose.model<Todo>('Todo', TodoSchema);
export default TodoModel;
