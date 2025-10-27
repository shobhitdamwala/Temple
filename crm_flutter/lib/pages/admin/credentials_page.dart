import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../models/client.dart';

class CredentialsPage extends StatefulWidget {
  const CredentialsPage({Key? key}) : super(key: key);

  @override
  State<CredentialsPage> createState() => _CredentialsPageState();
}

class _CredentialsPageState extends State<CredentialsPage> {
  final Map<String, String> _credentials = {}; // clientId -> password

  final _passwordController = TextEditingController();
  String? _selectedClientId;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DataProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Client Credentials')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Select Client'),
              value: _selectedClientId,
              items: provider.clients.map((c)=>DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
              onChanged: (v)=>setState((){_selectedClientId=v;}),
            ),
            const SizedBox(height:8),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
            ),
            const SizedBox(height:8),
            ElevatedButton(
              onPressed: (){
                if(_selectedClientId!=null && _passwordController.text.isNotEmpty){
                  setState((){
                    _credentials[_selectedClientId!] = _passwordController.text;
                    _passwordController.clear();
                    _selectedClientId = null;
                  });
                }
              },
              child: const Text('Set Password'),
            ),
            const Divider(),
            Expanded(
              child: ListView(
                children: _credentials.entries.map((e){
                  final client = provider.clients.firstWhere(
                    (c)=>c.id==e.key,
                    orElse: ()=>Client(id:'', name:'Unknown', email:'', company:''));
                  return ListTile(
                    leading: const Icon(Icons.vpn_key),
                    title: Text(client.name),
                    subtitle: Text('Password: ${e.value}'),
                  );
                }).toList(),
              ),
            )
          ],
        ),
      ),
    );
  }
}