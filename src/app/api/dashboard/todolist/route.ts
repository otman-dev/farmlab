import { NextResponse } from 'next/server';
import { getCloudUserModel } from '@/lib/mongodb-cloud';
import TodoModel from '@/models/Todo';

// Helper to get the Todo model using the cloud connection
async function getCloudTodoModel() {
  const conn = await (await getCloudUserModel()).db;
  return conn.models.Todo || conn.model('Todo', TodoModel.schema);
}

// Get all todos
export async function GET() {
  try {
    const Todo = await getCloudTodoModel();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todos = await (Todo as any).find({}).populate('user', 'name email').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ todos });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// Add a new todo
export async function POST(request: Request) {
  try {
    const { title, user, priority, category, dueDate } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const Todo = await getCloudTodoModel();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todo = await (Todo as any).create({
      title,
      user,
      priority: priority || 'medium',
      category: category || 'general',
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populatedTodo = await (Todo as any).findById(todo._id).populate('user', 'name email');
    return NextResponse.json({ todo: populatedTodo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add todo' }, { status: 500 });
  }
}


// Update a todo (mark complete/incomplete or edit title)
export async function PUT(request: Request) {
  try {
    const { _id, title, completed, priority, category, dueDate } = await request.json();
    if (!_id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 });
    }
    const Todo = await getCloudTodoModel();
    const update: Partial<{
      title?: string;
      completed?: boolean;
      priority?: string;
      category?: string;
      dueDate?: Date
    }> = {};
    if (title !== undefined) update.title = title;
    if (completed !== undefined) update.completed = completed;
    if (priority !== undefined) update.priority = priority;
    if (category !== undefined) update.category = category;
    if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (Todo as any).findByIdAndUpdate(_id, update, { new: true }).populate('user', 'name email');
    if (!updated) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json({ todo: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

// Delete a todo
export async function DELETE(request: Request) {
  try {
    const { _id } = await request.json();
    if (!_id) {
      return NextResponse.json({ error: 'Todo ID is required' }, { status: 400 });
    }
    const Todo = await getCloudTodoModel();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleted = await (Todo as any).findByIdAndDelete(_id);
    if (!deleted) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
