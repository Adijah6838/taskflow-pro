import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';

interface TaskModalProps {
  task: any;
  onClose: () => void;
}

const TaskModal = ({ task, onClose }: TaskModalProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commentsRes, activitiesRes] = await Promise.all([
          api.get(`/collab/tasks/${task.id}/comments`),
          api.get(`/collab/tasks/${task.id}/activities`)
        ]);
        setComments(commentsRes.data.comments);
        setActivities(activitiesRes.data.activities);
      } catch (err) {
        console.error('Failed to load task details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [task.id]);

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const res = await api.post(`/collab/tasks/${task.id}/comments`, { content: newComment });
      setComments([...comments, res.data.comment]);
      setNewComment('');
      // In a real app, you might also refetch activities here to show the new comment
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-start bg-gray-50 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{task.title}</h2>
            <div className="flex gap-2 mt-2">
              <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-700">{task.status}</span>
              <span className="text-xs font-bold px-2 py-1 bg-blue-100 rounded text-blue-700">{task.priority}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        
        {/* Body */}
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Details & Comments */}
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Comments</h3>
                <div className="space-y-3 mb-4 flex-1 overflow-y-auto max-h-48 pr-2">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                      <span className="font-bold text-gray-800">{c.userName}</span>
                      <p className="text-gray-600 mt-1">{c.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-sm text-gray-400 italic">No comments yet.</p>}
                </div>
                <form onSubmit={handleAddComment} className="flex gap-2 mt-auto">
                  <input 
                    type="text" 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition">Send</button>
                </form>
              </div>
            </div>
            
            {/* Right: Activity Log */}
            <div className="border-l pl-0 md:pl-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Activity History</h3>
              <div className="space-y-4 relative border-l border-gray-200 ml-2">
                {activities.map((a) => (
                  <div key={a.id} className="relative pl-4 text-sm">
                    <span className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></span>
                    <p className="text-gray-800"><span className="font-bold">{a.userName}</span> {a.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {activities.length === 0 && <p className="text-sm text-gray-400 italic pl-4">No activity recorded.</p>}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;