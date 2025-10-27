class Lead {
  final String id;
  String name;
  String contact;
  String company;
  String status;

  Lead({
    required this.id,
    required this.name,
    required this.contact,
    required this.company,
    this.status = 'New',
  });
}