import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/data_provider.dart';
import '../../models/lead.dart';

class LeadsPage extends StatefulWidget {
  const LeadsPage({Key? key}) : super(key: key);

  @override
  State<LeadsPage> createState() => _LeadsPageState();
}

class _LeadsPageState extends State<LeadsPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _contactController = TextEditingController();
  final _companyController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DataProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Leads')),
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
                    controller: _contactController,
                    decoration: const InputDecoration(labelText: 'Contact'),
                    validator: (v)=>v==null||v.isEmpty?'Enter contact':null,
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
                        provider.addLead(_nameController.text, _contactController.text, _companyController.text);
                        _nameController.clear();
                        _contactController.clear();
                        _companyController.clear();
                      }
                    },
                    child: const Text('Add Lead'),
                  ),
                ],
              ),
            ),
            const SizedBox(height:16),
            Expanded(
              child: ListView.builder(
                itemCount: provider.leads.length,
                itemBuilder: (context, index){
                  final lead = provider.leads[index];
                  return ListTile(
                    leading: const Icon(Icons.person_outline),
                    title: Text(lead.name),
                    subtitle: Text('${lead.company} | ${lead.contact}'),
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