import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/data_provider.dart';
import '../../../models/team_member.dart';

class TeamMembersPage extends StatefulWidget {
  const TeamMembersPage({Key? key}) : super(key: key);

  @override
  State<TeamMembersPage> createState() => _TeamMembersPageState();
}

class _TeamMembersPageState extends State<TeamMembersPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _roleController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final dataProvider = Provider.of<DataProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Team Members')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: dataProvider.teamMembers.length,
              itemBuilder: (context, index) {
                final member = dataProvider.teamMembers[index];
                return ListTile(
                  leading: const Icon(Icons.person),
                  title: Text(member.name),
                  subtitle: Text(member.role),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Name'),
                    validator: (value) =>
                        value == null || value.isEmpty ? 'Enter name' : null,
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _roleController,
                    decoration: const InputDecoration(labelText: 'Role'),
                    validator: (value) =>
                        value == null || value.isEmpty ? 'Enter role' : null,
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        dataProvider.addTeamMember(
                            _nameController.text, _roleController.text);
                        _nameController.clear();
                        _roleController.clear();
                      }
                    },
                    child: const Text('Add Team Member'),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}