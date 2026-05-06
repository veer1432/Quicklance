import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Save
} from 'lucide-react';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { AvailabilitySlot } from '@/src/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Calendar() {
  const { profile, updateProfile } = useFirebase();
  const [isSaving, setIsSaving] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>(profile?.availability || []);

  React.useEffect(() => {
    if (profile?.availability) {
      setSlots(profile.availability);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ availability: slots });
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSlot = (day: string) => {
    const newSlot: AvailabilitySlot = { day, startTime: '09:00', endTime: '17:00' };
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (idx: number) => {
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx: number, data: Partial<AvailabilitySlot>) => {
    const newSlots = [...slots];
    newSlots[idx] = { ...newSlots[idx], ...data };
    setSlots(newSlots);
  };

  return (
    <div className="space-y-12 transition-colors duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">Availability & Calendar</h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Set your working hours so clients can book you.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/20">
          {isSaving ? 'Saving...' : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Availability
            </>
          )}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Weekly Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {DAYS.map((day) => {
            const daySlots = slots.filter(s => s.day === day);
            return (
              <Card key={day} className="p-8" hover={false}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{day}</h3>
                  <Button variant="outline" size="sm" onClick={() => addSlot(day)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Slot
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {daySlots.map((slot) => {
                    const globalIdx = slots.indexOf(slot);
                    return (
                      <div key={globalIdx} className="flex items-center gap-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-100 dark:border-gray-800">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={slot.startTime}
                            onChange={(e) => updateSlot(globalIdx, { startTime: e.target.value })}
                            className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                          <span className="text-gray-400 dark:text-gray-500 font-bold">to</span>
                          <input 
                            type="time" 
                            value={slot.endTime}
                            onChange={(e) => updateSlot(globalIdx, { endTime: e.target.value })}
                            className="h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <button 
                          onClick={() => removeSlot(globalIdx)}
                          className="ml-auto text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })}
                  {daySlots.length === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium italic">No availability set for this day.</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Sidebar: Tips */}
        <div className="space-y-8">
          <Card className="p-8 bg-gray-900 dark:bg-gray-900/50 text-white border-none">
            <CheckCircle2 className="h-10 w-10 mb-4 text-green-400" />
            <h3 className="text-xl font-bold mb-2">Maximize your bookings</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Experts with at least 20 hours of availability per week receive 3x more requests. Try to set consistent slots!
            </p>
          </Card>

          <Card className="p-8 border-2 border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20">
            <AlertCircle className="h-10 w-10 mb-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Timezone Notice</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              All times are displayed in your local timezone: <span className="font-bold text-gray-900 dark:text-gray-100">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
