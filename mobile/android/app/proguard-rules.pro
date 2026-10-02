# Flutter Proguard Rules for Have On Behalf Mobile Companion
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.**  { *; }

# Keep data models
-keep class com.haveonbehalf.have_on_behalf_companion.** { *; }

# Google Fonts
-dontwarn com.google.fonts.**
