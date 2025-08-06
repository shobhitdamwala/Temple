import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../models/task.dart';
import '../models/team_member.dart';

class TeamMemberPage extends StatefulWidget {
  const TeamMemberPage({Key? key}) : super(key: key);

  @override
  State<TeamMemberPage> createState() => _TeamMemberPageState();
}

class _TeamMemberPageState extends State<TeamMemberPage> {
  String? _selectedMemberId;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DataProvider>(context);

    final memberTasks = provider.tasks
        .where((t) => t.assignedTo == _selectedMemberId)
        .toList();

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Select Team Member'),
              value: _selectedMemberId,
              items: provider.teamMembers
                  .map((m) => DropdownMenuItem(value: m.id, child: Text(m.name)))
                  .toList(),
              onChanged: (v) => setState(() => _selectedMemberId = v),
            ),
            const SizedBox(height: 16),
            if (_selectedMemberId == null)
              const Text('Select member to view tasks')
            else if (memberTasks.isEmpty)
              const Text('No tasks assigned')
            else
              Expanded(
                child: ListView.builder(
                  itemCount: memberTasks.length,
                  itemBuilder: (context, index) {
                    final task = memberTasks[index];
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.task),
                        title: Text(task.title),
                        subtitle: Text('Deadline: ${task.deadline.toLocal().toString().split(' ')[0]}'),
                        trailing: DropdownButton<TaskStatus>(
                          value: task.status,
                          items: const [
                            DropdownMenuItem(value: TaskStatus.pending, child: Text('Pending')),
                            DropdownMenuItem(value: TaskStatus.inProgress, child: Text('In Progress')),
                            DropdownMenuItem(value: TaskStatus.completed, child: Text('Completed')),
                          ],
                          onChanged: (status) {
                            if (status != null) {
                              provider.updateTaskStatus(task.id, status);
                            }
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}