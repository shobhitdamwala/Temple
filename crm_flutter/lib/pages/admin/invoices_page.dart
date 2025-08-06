import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

class InvoicesPage extends StatefulWidget {
  const InvoicesPage({Key? key}) : super(key: key);

  @override
  State<InvoicesPage> createState() => _InvoicesPageState();
}

class _InvoicesPageState extends State<InvoicesPage> {
  final _uuid = const Uuid();
  final Map<String, String> _generatedInvoices = {}; // company -> invoiceId
  final List<String> _companies = ['Aghori', 'Jogi', 'Damru', 'Paninghana', 'Kalyanam'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Generate Invoices')),
      body: ListView.builder(
          itemCount: _companies.length,
          itemBuilder: (context, index) {
            final company = _companies[index];
            final invoiceNumber = _generatedInvoices[company];
            return Card(
              child: ListTile(
                leading: const Icon(Icons.receipt_long),
                title: Text(company),
                subtitle: invoiceNumber != null ? Text('Invoice #: $invoiceNumber') : null,
                trailing: ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _generatedInvoices[company] = _uuid.v4().substring(0, 8).toUpperCase();
                    });
                  },
                  child: Text(invoiceNumber == null ? 'Generate' : 'Regenerate'),
                ),
              ),
            );
          }),
    );
  }
}