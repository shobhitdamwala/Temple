import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/data_provider.dart';
import '../../models/task.dart';
import '../../models/team_member.dart';

class TasksPage extends StatefulWidget {
  const TasksPage({Key? key}) : super(key: key);

  @override
  State<TasksPage> createState() => _TasksPageState();
}

class _TasksPageState extends State<TasksPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  DateTime? _selectedDeadline;
  String? _selectedMemberId;

  @override
  Widget build(BuildContext context) {
    final dataProvider = Provider.of<DataProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Tasks')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Assign New Task', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(labelText: 'Title'),
                      validator: (v)=>v==null||v.isEmpty? 'Enter title':null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(labelText: 'Description'),
                    ),
                    const SizedBox(height: 8),
                    ListTile(
                      title: Text(_selectedDeadline==null? 'Pick Deadline': DateFormat.yMd().format(_selectedDeadline!)),
                      trailing: const Icon(Icons.calendar_today),
                      onTap: () async {
                        final now = DateTime.now();
                        final picked = await showDatePicker(context: context, initialDate: now, firstDate: now, lastDate: DateTime(now.year+5));
                        if(picked!=null){
                          setState(()=>_selectedDeadline=picked);
                        }
                      },
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(labelText: 'Assign to'),
                      value: _selectedMemberId,
                      items: dataProvider.teamMembers.map((member)=>DropdownMenuItem(value: member.id, child: Text(member.name))).toList(),
                      onChanged: (value)=>setState(()=>_selectedMemberId=value),
                      validator: (v)=>v==null? 'Select member':null,
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: (){
                        if(_formKey.currentState!.validate() && _selectedDeadline!=null){
                          dataProvider.addTask(_titleController.text, _descriptionController.text, _selectedDeadline!, _selectedMemberId!);
                          _titleController.clear();
                          _descriptionController.clear();
                          setState((){
                            _selectedDeadline=null;
                            _selectedMemberId=null;
                          });
                        }
                      },
                      child: const Text('Add Task'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height:16),
              const Text('Existing Tasks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const Divider(),
              ...dataProvider.tasks.map((task){
                final member = dataProvider.teamMembers.firstWhere((m)=>m.id==task.assignedTo, orElse: ()=>TeamMember(id:'',name:'Unknown',role:''));
                return Card(
                  child: ListTile(
                    title: Text(task.title),
                    subtitle: Text('Assigned to: ${member.name} | Deadline: ${DateFormat.yMd().format(task.deadline)}'),
                    trailing: DropdownButton<TaskStatus>(
                      value: task.status,
                      items: const [
                        DropdownMenuItem(value: TaskStatus.pending, child: Text('Pending')),
                        DropdownMenuItem(value: TaskStatus.inProgress, child: Text('In Progress')),
                        DropdownMenuItem(value: TaskStatus.completed, child: Text('Completed')),
                      ],
                      onChanged: (status){
                        if(status!=null){
                          dataProvider.updateTaskStatus(task.id, status);
                        }
                      },
                    ),
                  ),
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }
}