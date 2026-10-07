import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { Project, Task } from '../types';

export const ProjectsScreen: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // New Task Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [savingTask, setSavingTask] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get('/projects').catch(() => null),
        api.get('/tasks').catch(() => null),
      ]);

      if (projRes?.data?.success) {
        setProjects(projRes.data.data);
        if (projRes.data.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projRes.data.data[0].id);
        }
      }

      if (taskRes?.data?.success) {
        setTasks(taskRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to load projects/tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      if (res.data.success) {
        setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
      }
    } catch (err: any) {
      Alert.alert('Update Error', err.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Required', 'Task name is required.');
      return;
    }
    if (!selectedProjectId) {
      Alert.alert('Select Project', 'Please select a project first.');
      return;
    }

    setSavingTask(true);
    try {
      const res = await api.post('/tasks', {
        projectId: selectedProjectId,
        name: taskName.trim(),
        description: taskDesc.trim() || undefined,
        priority,
      });

      if (res.data.success) {
        setTasks([res.data.data, ...tasks]);
        setTaskName('');
        setTaskDesc('');
        setModalVisible(false);
        Alert.alert('Task Created ✅', 'New task added to project itinerary.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not create task.');
    } finally {
      setSavingTask(false);
    }
  };

  const filteredTasks = selectedProjectId
    ? tasks.filter((t) => t.projectId === selectedProjectId)
    : tasks;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerBadge}>TRIP ITINERARY & EXECUTION</Text>
      <Text style={styles.screenTitle}>Projects & Tasks</Text>

      {/* Project Selector Pills */}
      <Text style={styles.sectionHeader}>SELECT PROJECT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectPillsRow}>
        {projects.map((proj) => {
          const isSelected = selectedProjectId === proj.id;
          return (
            <TouchableOpacity
              key={proj.id}
              style={[styles.projectPill, isSelected && styles.projectPillActive]}
              onPress={() => setSelectedProjectId(proj.id)}
            >
              <Text style={[styles.projectPillText, isSelected && styles.projectPillTextActive]}>
                📁 {proj.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tasks List */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeader}>
            CHECKLIST ITEMS ({filteredTasks.length})
          </Text>
          <TouchableOpacity
            style={styles.addTaskBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addTaskBtnText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : filteredTasks.length === 0 ? (
          <Text style={styles.emptyText}>No checklist tasks for this project.</Text>
        ) : (
          filteredTasks.map((t) => {
            const isDone = t.status === 'COMPLETED';
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.taskItem, isDone && styles.taskItemDone]}
                onPress={() => handleToggleTaskStatus(t)}
              >
                <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
                  {isDone && <Text style={{ fontSize: 12, color: '#0B132B' }}>✓</Text>}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                    {t.name}
                  </Text>
                  {t.description && (
                    <Text style={styles.taskDesc} numberOfLines={2}>
                      {t.description}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.priorityBadge,
                    t.priority === 'HIGH'
                      ? styles.priorityHigh
                      : t.priority === 'LOW'
                      ? styles.priorityLow
                      : styles.priorityMedium,
                  ]}
                >
                  <Text style={styles.priorityText}>{t.priority}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Create Task Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Itinerary Task</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Task Name</Text>
              <TextInput
                style={styles.modalInput}
                value={taskName}
                onChangeText={setTaskName}
                placeholder="e.g. Verify cab plate at Terminal 1"
                placeholderTextColor={Colors.textDim}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Description / Notes</Text>
              <TextInput
                style={[styles.modalInput, { height: 70 }]}
                value={taskDesc}
                onChangeText={setTaskDesc}
                placeholder="Optional details..."
                placeholderTextColor={Colors.textDim}
                multiline
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      priority === p && styles.priorityOptionActive,
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        priority === p && styles.priorityOptionTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={handleCreateTask}
                disabled={savingTask}
              >
                {savingTask ? (
                  <ActivityIndicator color="#0B132B" />
                ) : (
                  <Text style={styles.saveModalText}>Add Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  headerBadge: {
    color: Colors.blue,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
    marginBottom: 14,
  },
  sectionHeader: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  projectPillsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  projectPill: {
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectPillActive: {
    backgroundColor: 'rgba(58, 134, 255, 0.2)',
    borderColor: Colors.blue,
  },
  projectPillText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  projectPillTextActive: {
    color: Colors.blue,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeader: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  addTaskBtn: {
    backgroundColor: 'rgba(58, 134, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addTaskBtnText: {
    color: Colors.blue,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 14,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  taskItemDone: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  taskTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskDesc: {
    color: Colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityHigh: {
    backgroundColor: 'rgba(239, 71, 111, 0.2)',
  },
  priorityMedium: {
    backgroundColor: 'rgba(255, 209, 102, 0.2)',
  },
  priorityLow: {
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
  },
  priorityText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityOptionActive: {
    borderColor: Colors.blue,
    backgroundColor: 'rgba(58, 134, 255, 0.2)',
  },
  priorityOptionText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  priorityOptionTextActive: {
    color: Colors.blue,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  saveModalBtn: {
    flex: 1,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveModalText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
