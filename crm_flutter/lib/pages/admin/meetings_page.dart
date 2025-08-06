import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class MeetingsPage extends StatefulWidget {
  const MeetingsPage({Key? key}) : super(key: key);

  @override
  State<MeetingsPage> createState() => _MeetingsPageState();
}

class _MeetingsPageState extends State<MeetingsPage> {
  final List<DateTime> _meetings = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meetings')),
      body: ListView.builder(
        itemCount: _meetings.length,
        itemBuilder: (context, index) {
          final date = _meetings[index];
          return ListTile(
            leading: const Icon(Icons.calendar_today),
            title: Text(DateFormat.yMMMMd().add_jm().format(date)),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final now = DateTime.now();
          final pickedDate = await showDatePicker(
              context: context,
              initialDate: now,
              firstDate: now,
              lastDate: DateTime(now.year + 5));
          if (pickedDate != null) {
            final pickedTime = await showTimePicker(
                context: context, initialTime: TimeOfDay.now());
            if (pickedTime != null) {
              setState(() {
                _meetings.add(DateTime(pickedDate.year, pickedDate.month, pickedDate.day, pickedTime.hour, pickedTime.minute));
              });
            }
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}