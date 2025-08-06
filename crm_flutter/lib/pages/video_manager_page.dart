import 'package:flutter/material.dart';

class VideoManagerPage extends StatelessWidget {
  const VideoManagerPage({Key? key}) : super(key: key);

  static const List<_Feature> _features = [
    _Feature(Icons.upload_file, 'Upload & Manage Videos/Photos'),
    _Feature(Icons.share, 'Share Files with Secure PIN'),
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
              leading: Icon(feature.icon, color: Colors.green),
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