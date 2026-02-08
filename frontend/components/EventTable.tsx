'use client';

import { Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';

export default function EventTable({ events, onEdit, onDelete }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event: any) => (
        <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
              event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {event.status}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
          
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {event.capacity} places
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(event)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
