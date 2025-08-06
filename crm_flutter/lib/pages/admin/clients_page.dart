import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../models/client.dart';

class ClientsPage extends StatefulWidget {
  const ClientsPage({Key? key}) : super(key: key);

  @override
  State<ClientsPage> createState() => _ClientsPageState();
}

class _ClientsPageState extends State<ClientsPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _companyController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DataProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Clients')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Name'),
                    validator: (v)=>v==null||v.isEmpty?'Enter name':null,
                  ),
                  const SizedBox(height:8),
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'Email'),
                    validator: (v)=>v==null||v.isEmpty?'Enter email':null,
                  ),
                  const SizedBox(height:8),
                  TextFormField(
                    controller: _companyController,
                    decoration: const InputDecoration(labelText: 'Company'),
                  ),
                  const SizedBox(height:8),
                  ElevatedButton(
                    onPressed:(){
                      if(_formKey.currentState!.validate()){
                        provider.addClient(_nameController.text, _emailController.text, _companyController.text);
                        _nameController.clear();
                        _emailController.clear();
                        _companyController.clear();
                      }
                    },
                    child: const Text('Add Client'),
                  ),
                ],
              ),
            ),
            const SizedBox(height:16),
            Expanded(
              child: ListView.builder(
                itemCount: provider.clients.length,
                itemBuilder: (context, index){
                  final client = provider.clients[index];
                  return ListTile(
                    leading: const Icon(Icons.account_circle),
                    title: Text(client.name),
                    subtitle: Text('${client.company} | ${client.email}'),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}