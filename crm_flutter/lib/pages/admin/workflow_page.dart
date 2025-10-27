import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../models/task.dart';
import '../../models/team_member.dart';

class WorkflowPage extends StatelessWidget {
  const WorkflowPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DataProvider>(context);

    Map<TaskStatus, List<Task>> grouped = {
      TaskStatus.pending: [],
      TaskStatus.inProgress: [],
      TaskStatus.completed: [],
    };
    for (var task in provider.tasks) {
      grouped[task.status]!.add(task);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Workflow Tracking')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: grouped.entries.map((entry) {
              final status = entry.key;
              final tasks = entry.value;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_statusToString(status), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ...tasks.map((task) {
                    final member = provider.teamMembers.firstWhere((m) => m.id == task.assignedTo, orElse: () => TeamMember(id: '', name: 'Unknown', role: ''));
                    return Card(
                      child: ListTile(
                        title: Text(task.title),
                        subtitle: Text('Assigned to: ${member.name} | Deadline: ${DateFormat.yMd().format(task.deadline)}'),
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 16),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  String _statusToString(TaskStatus status) {
    switch (status) {
      case TaskStatus.pending:
        return 'Pending';
      case TaskStatus.inProgress:
        return 'In Progress';
      case TaskStatus.completed:
        return 'Completed';
    }
  }
}