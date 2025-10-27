import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';

class VideoManagerPage extends StatefulWidget {
  const VideoManagerPage({Key? key}) : super(key: key);

  @override
  State<VideoManagerPage> createState() => _VideoManagerPageState();
}

class _VideoManagerPageState extends State<VideoManagerPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  String _type = 'video';
  final _urlController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DataProvider>(context);

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Upload Media', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _titleController,
                    decoration: const InputDecoration(labelText: 'Title'),
                    validator: (v)=>v==null||v.isEmpty?'Enter title':null,
                  ),
                  const SizedBox(height:8),
                  DropdownButtonFormField<String>(
                    value: _type,
                    decoration: const InputDecoration(labelText: 'Type'),
                    items: const [
                      DropdownMenuItem(value: 'video', child: Text('Video')),
                      DropdownMenuItem(value: 'photo', child: Text('Photo')),
                    ],
                    onChanged: (v)=>setState(()=>_type=v!),
                  ),
                  const SizedBox(height:8),
                  TextFormField(
                    controller: _urlController,
                    decoration: const InputDecoration(labelText: 'URL (dummy link)'),
                    validator: (v)=>v==null||v.isEmpty?'Enter URL':null,
                  ),
                  const SizedBox(height:8),
                  ElevatedButton(
                    onPressed: (){
                      if(_formKey.currentState!.validate()){
                        provider.addMediaFile(_titleController.text, _type, _urlController.text);
                        _titleController.clear();
                        _urlController.clear();
                      }
                    },
                    child: const Text('Add Media'),
                  ),
                ],
              ),
            ),
            const SizedBox(height:16),
            const Text('Media Library', style: TextStyle(fontSize: 18,fontWeight: FontWeight.bold)),
            Expanded(
              child: ListView.builder(
                itemCount: provider.mediaFiles.length,
                itemBuilder: (context,index){
                  final media = provider.mediaFiles[index];
                  return Card(
                    child: ListTile(
                      leading: Icon(media.type=='video'? Icons.videocam : Icons.photo),
                      title: Text(media.title),
                      subtitle: Text('PIN: ${media.pin}'),
                      trailing: IconButton(
                        icon: const Icon(Icons.copy),
                        onPressed: (){
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('PIN ${media.pin} copied')),
                          );
                        },
                      ),
                    ),
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }
}