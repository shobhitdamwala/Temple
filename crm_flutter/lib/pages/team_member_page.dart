import 'package:flutter/material.dart';

class TeamMemberPage extends StatelessWidget {
  const TeamMemberPage({Key? key}) : super(key: key);

  static const List<_Feature> _features = [
    _Feature(Icons.task, 'View Assigned Tasks'),
    _Feature(Icons.edit, 'Edit Tasks'),
    _Feature(Icons.timer, 'View Deadlines'),
    _Feature(Icons.folder_shared, 'View Assigned Client Projects'),
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
              leading: Icon(feature.icon, color: Colors.blueAccent),
              title: Text(feature.title),
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