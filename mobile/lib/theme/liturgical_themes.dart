import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

enum LiturgicalPalette {
  sapphire,
  emerald,
  amethyst,
  bronze,
  rose;

  String get id {
    switch (this) {
      case LiturgicalPalette.sapphire:
        return 'sapphire';
      case LiturgicalPalette.emerald:
        return 'emerald';
      case LiturgicalPalette.amethyst:
        return 'amethyst';
      case LiturgicalPalette.bronze:
        return 'bronze';
      case LiturgicalPalette.rose:
        return 'rose';
    }
  }

  String get displayName {
    switch (this) {
      case LiturgicalPalette.sapphire:
        return 'Sanctuary Sapphire';
      case LiturgicalPalette.emerald:
        return 'Sacred Emerald';
      case LiturgicalPalette.amethyst:
        return 'Royal Amethyst';
      case LiturgicalPalette.bronze:
        return 'Cathedral Bronze';
      case LiturgicalPalette.rose:
        return 'Words of Christ';
    }
  }

  String get description {
    switch (this) {
      case LiturgicalPalette.sapphire:
        return 'Deep navy & celestial amber';
      case LiturgicalPalette.emerald:
        return 'Garden of Eden & eternal life';
      case LiturgicalPalette.amethyst:
        return 'Sovereignty & royal majesty';
      case LiturgicalPalette.bronze:
        return 'Altar brass & liturgical gold';
      case LiturgicalPalette.rose:
        return 'The atonement & scarlet grace';
    }
  }

  Color get primaryColor {
    switch (this) {
      case LiturgicalPalette.sapphire:
        return const Color(0xFF1E3A8A); // Blue 900
      case LiturgicalPalette.emerald:
        return const Color(0xFF065F46); // Emerald 800
      case LiturgicalPalette.amethyst:
        return const Color(0xFF581C87); // Purple 900
      case LiturgicalPalette.bronze:
        return const Color(0xFF78350F); // Amber 900
      case LiturgicalPalette.rose:
        return const Color(0xFF881337); // Rose 900
    }
  }

  Color get accentColor {
    switch (this) {
      case LiturgicalPalette.sapphire:
        return const Color(0xFFF59E0B); // Amber 500
      case LiturgicalPalette.emerald:
        return const Color(0xFF10B981); // Emerald 500
      case LiturgicalPalette.amethyst:
        return const Color(0xFFA855F7); // Purple 500
      case LiturgicalPalette.bronze:
        return const Color(0xFFD97706); // Amber 600
      case LiturgicalPalette.rose:
        return const Color(0xFFF43F5E); // Rose 500
    }
  }
}

class LiturgicalThemes {
  static TextStyle getHymnTitleStyle({
    required bool useSerif,
    required bool isDark,
    double fontSize = 16,
  }) {
    if (useSerif) {
      return GoogleFonts.merriweather(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A),
      );
    }
    return GoogleFonts.plusJakartaSans(
      fontSize: fontSize,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.2,
      color: isDark ? const Color(0xFFF8FAFC) : const Color(0xFF0F172A),
    );
  }

  static TextStyle getHymnLyricsStyle({
    required bool useSerif,
    required bool isDark,
    double fontSize = 16.5,
    bool isChorus = false,
  }) {
    if (useSerif) {
      return GoogleFonts.merriweather(
        fontSize: fontSize,
        height: 1.6,
        fontStyle: isChorus ? FontStyle.italic : FontStyle.normal,
        fontWeight: isChorus ? FontWeight.w500 : FontWeight.w400,
        color: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B),
      );
    }
    return GoogleFonts.plusJakartaSans(
      fontSize: fontSize,
      height: 1.55,
      fontStyle: isChorus ? FontStyle.italic : FontStyle.normal,
      fontWeight: isChorus ? FontWeight.w600 : FontWeight.w400,
      color: isDark ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B),
    );
  }

  static ThemeData getTheme({
    required LiturgicalPalette palette,
    required bool isDarkMode,
    bool pureOledBlack = false,
    bool useSerif = false,
    double fontScale = 1.0,
  }) {
    final primary = palette.primaryColor;
    final accent = palette.accentColor;

    // Modern Typography as default (Plus Jakarta Sans)
    final baseTextTheme = useSerif
        ? GoogleFonts.merriweatherTextTheme(
            isDarkMode ? ThemeData.dark().textTheme : ThemeData.light().textTheme,
          )
        : GoogleFonts.plusJakartaSansTextTheme(
            isDarkMode ? ThemeData.dark().textTheme : ThemeData.light().textTheme,
          );

    if (isDarkMode) {
      final bg = pureOledBlack ? const Color(0xFF000000) : const Color(0xFF0B1120);
      final surface = pureOledBlack ? const Color(0xFF0D1424) : const Color(0xFF151F32);
      final cardSurface = pureOledBlack ? const Color(0xFF111827) : const Color(0xFF1E293B);
      final border = pureOledBlack ? const Color(0xFF1F2937) : const Color(0xFF2E3D56);

      return ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bg,
        colorScheme: ColorScheme.dark(
          primary: accent,
          onPrimary: Colors.black,
          secondary: primary,
          surface: surface,
          outline: border,
          outlineVariant: border.withOpacity(0.6),
        ),
        cardTheme: CardTheme(
          color: cardSurface,
          elevation: 0,
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(color: border, width: 1),
          ),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: bg,
          foregroundColor: const Color(0xFFF8FAFC),
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          titleTextStyle: (useSerif
                  ? GoogleFonts.merriweather(fontWeight: FontWeight.w700)
                  : GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, letterSpacing: -0.3))
              .copyWith(fontSize: 18 * fontScale, color: const Color(0xFFF8FAFC)),
          iconTheme: const IconThemeData(color: Color(0xFFE2E8F0)),
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: surface,
          selectedItemColor: accent,
          unselectedItemColor: const Color(0xFF64748B),
          type: BottomNavigationBarType.fixed,
          elevation: 8,
          selectedLabelStyle: TextStyle(fontSize: 12 * fontScale, fontWeight: FontWeight.bold),
          unselectedLabelStyle: TextStyle(fontSize: 12 * fontScale),
        ),
        dividerColor: border,
        textTheme: baseTextTheme.copyWith(
          titleLarge: (useSerif
                  ? GoogleFonts.merriweather(fontWeight: FontWeight.w700)
                  : GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700))
              .copyWith(fontSize: 20 * fontScale, color: const Color(0xFFF8FAFC)),
          titleMedium: (useSerif
                  ? GoogleFonts.merriweather(fontWeight: FontWeight.w600)
                  : GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600))
              .copyWith(fontSize: 16 * fontScale, color: const Color(0xFFF1F5F9)),
          bodyLarge: (useSerif
                  ? GoogleFonts.merriweather()
                  : GoogleFonts.plusJakartaSans())
              .copyWith(fontSize: 16 * fontScale, color: const Color(0xFFE2E8F0)),
          bodyMedium: (useSerif
                  ? GoogleFonts.merriweather()
                  : GoogleFonts.plusJakartaSans())
              .copyWith(fontSize: 14 * fontScale, color: const Color(0xFF94A3B8)),
        ),
        useMaterial3: true,
      );
    } else {
      const bg = Color(0xFFF8FAFC); // Slate 50
      const surface = Colors.white;
      const border = Color(0xFFE2E8F0); // Slate 200

      return ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: bg,
        colorScheme: ColorScheme.light(
          primary: primary,
          onPrimary: Colors.white,
          secondary: accent,
          surface: surface,
          outline: border,
          outlineVariant: const Color(0xFFCBD5E1),
        ),
        cardTheme: CardTheme(
          color: surface,
          elevation: 0,
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: border, width: 1),
          ),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: surface,
          foregroundColor: const Color(0xFF0F172A),
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          titleTextStyle: (useSerif
                  ? GoogleFonts.merriweather(fontWeight: FontWeight.w700)
                  : GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, letterSpacing: -0.3))
              .copyWith(fontSize: 18 * fontScale, color: const Color(0xFF0F172A)),
          iconTheme: const IconThemeData(color: Color(0xFF334155)),
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: surface,
          selectedItemColor: primary,
          unselectedItemColor: const Color(0xFF94A3B8),
          type: BottomNavigationBarType.fixed,
          elevation: 8,
          selectedLabelStyle: TextStyle(fontSize: 12 * fontScale, fontWeight: FontWeight.bold),
          unselectedLabelStyle: TextStyle(fontSize: 12 * fontScale),
        ),
        dividerColor: border,
        textTheme: baseTextTheme.copyWith(
          titleLarge: (useSerif
                  ? GoogleFonts.merriweather(fontWeight: FontWeight.w700)
                  : GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700))
              .copyWith(fontSize: 20 * fontScale, color: const Color(0xFF0F172A)),
          titleMedium: (useSerif
                  ? GoogleFonts.merriweather(fontWeight: FontWeight.w600)
                  : GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600))
              .copyWith(fontSize: 16 * fontScale, color: const Color(0xFF1E293B)),
          bodyLarge: (useSerif
                  ? GoogleFonts.merriweather()
                  : GoogleFonts.plusJakartaSans())
              .copyWith(fontSize: 16 * fontScale, color: const Color(0xFF1E293B)),
          bodyMedium: (useSerif
                  ? GoogleFonts.merriweather()
                  : GoogleFonts.plusJakartaSans())
              .copyWith(fontSize: 14 * fontScale, color: const Color(0xFF64748B)),
        ),
        useMaterial3: true,
      );
    }
  }
}
