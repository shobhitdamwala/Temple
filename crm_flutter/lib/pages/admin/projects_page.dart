import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../models/project.dart';

class ProjectsPage extends StatefulWidget {
  const ProjectsPage({Key? key}) : super(key: key);

  @override
  State<ProjectsPage> createState() => _ProjectsPageState();
}

class _ProjectsPageState extends State<ProjectsPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _clientController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DataProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Projects')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Project Name'),
                      validator: (v)=>v==null||v.isEmpty?'Enter name':null,
                    ),
                    const SizedBox(height:8),
                    TextFormField(
                      controller: _clientController,
                      decoration: const InputDecoration(labelText: 'Client Name'),
                    ),
                    const SizedBox(height:8),
                    ListTile(
                      title: Text(_startDate==null? 'Select Start Date': DateFormat.yMd().format(_startDate!)),
                      trailing: const Icon(Icons.date_range),
                      onTap: () async {
                        final picked = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2000), lastDate: DateTime(2100));
                        if(picked!=null){
                          setState(()=>_startDate=picked);
                        }
                      },
                    ),
                    ListTile(
                      title: Text(_endDate==null? 'Select End Date': DateFormat.yMd().format(_endDate!)),
                      trailing: const Icon(Icons.date_range),
                      onTap: () async {
                        final picked = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(2000), lastDate: DateTime(2100));
                        if(picked!=null){
                          setState(()=>_endDate=picked);
                        }
                      },
                    ),
                    ElevatedButton(
                      onPressed:(){
                        if(_formKey.currentState!.validate() && _startDate!=null && _endDate!=null){
                          provider.addProject(_nameController.text, _clientController.text, _startDate!, _endDate!);
                          _nameController.clear();
                          _clientController.clear();
                          setState((){
                            _startDate=null;
                            _endDate=null;
                          });
                        }
                      },
                      child: const Text('Add Project'),
                    ),
                  ],
                ),
              ),
              const Divider(),
              ...provider.projects.map((p)=>Card(
                child: ListTile(
                  leading: const Icon(Icons.work_outline),
                  title: Text(p.name),
                  subtitle: Text('Client: ${p.clientName}\n${DateFormat.yMd().format(p.startDate)} - ${DateFormat.yMd().format(p.endDate)}'),
                ),
              ))
            ],
          ),
        ),
      ),
    );
  }
}