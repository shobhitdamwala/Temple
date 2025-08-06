import 'package:flutter/material.dart';

class AdminPage extends StatelessWidget {
  const AdminPage({Key? key}) : super(key: key);

  static const List<_Feature> _features = [
    _Feature(Icons.person_add, 'Add Team Members'),
    _Feature(Icons.assignment_turned_in, 'Assign Tasks'),
    _Feature(Icons.leaderboard, 'View All Leads'),
    _Feature(Icons.calendar_today, 'Set Meetings'),
    _Feature(Icons.track_changes, 'Workflow Tracking'),
    _Feature(Icons.receipt_long, 'Generate Invoices'),
    _Feature(Icons.account_circle, 'Show Client Details'),
    _Feature(Icons.password, 'Manage Client IDs & Passwords'),
    _Feature(Icons.add_box, 'Add New Projects'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView.builder(
        itemCount: _features.length,
        itemBuilder: (context, index) {
          final feature = _features[index];
          return Card(
            elevation: 2,
            margin: const EdgeInsets.symmetric(vertical: 8),
            child: ListTile(
              leading: Icon(feature.icon, color: Colors.deepPurple),
              title: Text(feature.title),
              onTap: () {
                switch (feature.title) {
                  case 'Add Team Members':
                    Navigator.pushNamed(context, '/admin/teamMembers');
                    break;
                  case 'Assign Tasks':
                    Navigator.pushNamed(context, '/admin/tasks');
                    break;
                  case 'View All Leads':
                    Navigator.pushNamed(context, '/admin/leads');
                    break;
                  case 'Set Meetings':
                    Navigator.pushNamed(context, '/admin/meetings');
                    break;
                  case 'Workflow Tracking':
                    Navigator.pushNamed(context, '/admin/workflow');
                    break;
                  case 'Generate Invoices':
                    Navigator.pushNamed(context, '/admin/invoices');
                    break;
                  case 'Show Client Details':
                    Navigator.pushNamed(context, '/admin/clients');
                    break;
                  case 'Manage Client IDs & Passwords':
                    Navigator.pushNamed(context, '/admin/credentials');
                    break;
                  case 'Add New Projects':
                    Navigator.pushNamed(context, '/admin/projects');
                    break;
                }
              },
            ),
          );
        },
      ),
    );
  }
}

class _Feature {
  final IconData icon;
  final String title;
  const _Feature(this.icon, this.title);
}