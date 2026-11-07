import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskModal from '../components/TaskModal';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedUserId: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

const COLUMNS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

const TaskCard = ({ task, onClick }: { task: Task, onClick: (task: Task) => void }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const priorityColors: any = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(task)}
      className="bg-white p-4 mb-3 rounded shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 text-sm flex-1">{task.title}</h4>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-bold px-2 py-1 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
};

const Column = ({ id, tasks, onTaskClick }: { id: string, tasks: Task[], onTaskClick: (task: Task) => void }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`bg-slate-100 rounded-lg p-4 w-72 flex-shrink-0 flex flex-col h-[calc(100vh-200px)] ${isOver ? 'ring-2 ring-blue-500 bg-slate-200' : ''}`}
    >
      <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
        {id.replace('_', ' ')}
        <span className="bg-gray-200 text-gray-600 text-xs py-1 px-2 rounded-full">{tasks.length}</span>
      </h3>
      <div className="flex-1 overflow-y-auto">
        {tasks.map(task => <TaskCard key={task.id} task={task} onClick={onTaskClick} />)}
      </div>
    </div>
  );
};

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM' });

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.status === newStatus) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update task status', err);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
    }
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading Board...</div>;
  if (!project) return <div className="text-center py-10">Project not found</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/projects" className="text-sm text-blue-600 hover:underline mb-2 inline-block">&larr; Back to Projects</Link>
          <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{project.description}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium shadow"
        >
          + Add Task
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map(col => (
            <Column 
              key={col} 
              id={col} 
              tasks={tasks.filter(t => t.status === col)} 
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </DndContext>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full border rounded p-2 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full border rounded p-2 mt-1" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full border rounded p-2 mt-1">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
