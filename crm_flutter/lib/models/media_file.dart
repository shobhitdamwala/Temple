class MediaFile {
  final String id;
  String title;
  String type; // video or photo
  String url;
  String pin;

  MediaFile({required this.id, required this.title, required this.type, required this.url, required this.pin});
}