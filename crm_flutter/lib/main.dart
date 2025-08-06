import 'package:flutter/material.dart';
import 'pages/admin_page.dart';
import 'pages/team_member_page.dart';
import 'pages/video_manager_page.dart';
import 'pages/client_page.dart';

void main() {
  runApp(const CrmApp());
}

class CrmApp extends StatelessWidget {
  const CrmApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'CRM App',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    AdminPage(),
    TeamMemberPage(),
    VideoManagerPage(),
    ClientPage(),
  ];

  static const List<String> _titles = <String>[
    'Admin',
    'Team Member',
    'Video Manager',
    'Client',
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_selectedIndex]),
        centerTitle: true,
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.deepPurple,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
              icon: Icon(Icons.admin_panel_settings), label: 'Admin'),
          BottomNavigationBarItem(icon: Icon(Icons.group), label: 'Team'),
          BottomNavigationBarItem(icon: Icon(Icons.video_library), label: 'Media'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Client'),
        ],
      ),
    );
  }
}