import 'package:flutter/material.dart';
import 'pages/admin_page.dart';
import 'pages/team_member_page.dart';
import 'pages/video_manager_page.dart';
import 'pages/client_page.dart';
import 'package:provider/provider.dart';
import 'providers/data_provider.dart';
import 'pages/admin/team_members_page.dart';
import 'pages/admin/tasks_page.dart';
import 'pages/admin/leads_page.dart';
import 'pages/admin/meetings_page.dart';
import 'pages/admin/workflow_page.dart';
import 'pages/admin/invoices_page.dart';
import 'pages/admin/clients_page.dart';
import 'pages/admin/credentials_page.dart';
import 'pages/admin/projects_page.dart';

void main() {
  runApp(const CrmRoot());
}

class CrmRoot extends StatelessWidget {
  const CrmRoot({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => DataProvider(),
      child: const CrmApp(),
    );
  }
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
      routes: {
        '/': (_) => const HomeScreen(),
        '/admin/teamMembers': (_) => const TeamMembersPage(),
        '/admin/tasks': (_) => const TasksPage(),
        '/admin/leads': (_) => const LeadsPage(),
        '/admin/meetings': (_) => const MeetingsPage(),
        '/admin/workflow': (_) => const WorkflowPage(),
        '/admin/invoices': (_) => const InvoicesPage(),
        '/admin/clients': (_) => const ClientsPage(),
        '/admin/credentials': (_) => const CredentialsPage(),
        '/admin/projects': (_) => const ProjectsPage(),
      },
      initialRoute: '/',
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