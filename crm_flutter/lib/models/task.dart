enum TaskStatus { pending, inProgress, completed }

class Task {
  final String id;
  String title;
  String description;
  DateTime deadline;
  TaskStatus status;
  String assignedTo; // team member id

  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.deadline,
    this.status = TaskStatus.pending,
    required this.assignedTo,
  });
}