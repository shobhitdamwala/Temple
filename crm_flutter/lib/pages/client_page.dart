import 'package:flutter/material.dart';

class ClientPage extends StatelessWidget {
  const ClientPage({Key? key}) : super(key: key);

  static const List<_Feature> _features = [
    _Feature(Icons.work_outline, 'View Delivered Work'),
    _Feature(Icons.dashboard, 'View Project Status & Team Members'),
    _Feature(Icons.link, 'Generate Access Links for Media'),
    _Feature(Icons.notifications, 'Receive Project Notifications'),
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
              leading: Icon(feature.icon, color: Colors.orangeAccent),
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