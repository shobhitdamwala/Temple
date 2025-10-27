import 'package:flutter/foundation.dart';
import '../models/team_member.dart';
import '../models/task.dart';
import '../models/lead.dart';
import '../models/project.dart';
import '../models/media_file.dart';
import '../models/client.dart';
import 'package:uuid/uuid.dart';

class DataProvider extends ChangeNotifier {
  final _uuid = const Uuid();

  final List<TeamMember> _teamMembers = [];
  final List<Task> _tasks = [];
  final List<Lead> _leads = [];
  final List<Project> _projects = [];
  final List<MediaFile> _mediaFiles = [];
  final List<Client> _clients = [];

  // Getters
  List<TeamMember> get teamMembers => List.unmodifiable(_teamMembers);
  List<Task> get tasks => List.unmodifiable(_tasks);
  List<Lead> get leads => List.unmodifiable(_leads);
  List<Project> get projects => List.unmodifiable(_projects);
  List<MediaFile> get mediaFiles => List.unmodifiable(_mediaFiles);
  List<Client> get clients => List.unmodifiable(_clients);

  // Team Members
  void addTeamMember(String name, String role) {
    _teamMembers.add(TeamMember(id: _uuid.v4(), name: name, role: role));
    notifyListeners();
  }

  // Tasks
  void addTask(String title, String description, DateTime deadline, String memberId) {
    _tasks.add(Task(
        id: _uuid.v4(),
        title: title,
        description: description,
        deadline: deadline,
        assignedTo: memberId));
    notifyListeners();
  }

  void updateTaskStatus(String taskId, TaskStatus status) {
    final task = _tasks.firstWhere((t) => t.id == taskId);
    task.status = status;
    notifyListeners();
  }

  // Leads
  void addLead(String name, String contact, String company) {
    _leads.add(Lead(id: _uuid.v4(), name: name, contact: contact, company: company));
    notifyListeners();
  }

  // Projects
  void addProject(String name, String clientName, DateTime start, DateTime end) {
    _projects.add(Project(id: _uuid.v4(), name: name, clientName: clientName, startDate: start, endDate: end));
    notifyListeners();
  }

  // MediaFiles
  void addMediaFile(String title, String type, String url) {
    _mediaFiles.add(MediaFile(id: _uuid.v4(), title: title, type: type, url: url, pin: _generatePin()));
    notifyListeners();
  }

  String _generatePin() {
    final pin = (1000 + (_uuid.v1().hashCode % 9000)).abs();
    return pin.toString();
  }

  // Clients
  void addClient(String name, String email, String company) {
    _clients.add(Client(id: _uuid.v4(), name: name, email: email, company: company));
    notifyListeners();
  }
}