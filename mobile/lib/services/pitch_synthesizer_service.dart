import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class KeySignatureData {
  final String effectiveKey;
  final String symbol; // e.g. "3♭", "2♯", "♮"
  final String summary; // e.g. "3 Flats (B♭, E♭, A♭)"
  final int count;
  final String type; // 'sharps', 'flats', 'natural'
  final List<String> accidentals;

  const KeySignatureData({
    required this.effectiveKey,
    required this.symbol,
    required this.summary,
    required this.count,
    required this.type,
    required this.accidentals,
  });
}

/// Pitch pipe frequency mapping and transposition helper with native acoustic tone playback
class PitchSynthesizerService extends ChangeNotifier {
  static const MethodChannel _channel = MethodChannel('com.haveonbehalf/pitch_audio');

  static const Map<String, double> standardFrequencies = {
    'C': 261.63,
    'C#': 277.18,
    'Db': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'Gb': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'Ab': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'Bb': 466.16,
    'B': 493.88,
  };

  static const List<String> chromaticScale = [
    'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
  ];

  bool _isPlaying = false;
  String? _currentlySoundingKey;
  int _playSessionId = 0;

  bool get isPlaying => _isPlaying;
  String? get currentlySoundingKey => _currentlySoundingKey;

  /// Calculates transposed note name
  static String transposeKey(String rootKey, int semitones) {
    final clean = rootKey.split(' ')[0].trim();
    final index = chromaticScale.indexOf(clean);
    if (index == -1) return rootKey;

    final newIndex = (index + semitones) % chromaticScale.length;
    final wrappedIndex = newIndex < 0 ? newIndex + chromaticScale.length : newIndex;
    return chromaticScale[wrappedIndex];
  }

  static const List<String> sharpsOrder = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'];
  static const List<String> flatsOrder = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'];

  static const Map<String, int> majorSharpsCount = {
    'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7
  };

  static const Map<String, int> majorFlatsCount = {
    'F': 1, 'Bb': 2, 'Eb': 3, 'Ab': 4, 'Db': 5, 'Gb': 6, 'Cb': 7
  };

  /// Calculates dynamic musical key signature and accidentals for a key and semitone offset
  static KeySignatureData getKeySignature(String rootKey, [int semitones = 0]) {
    final effective = transposeKey(rootKey, semitones);
    final clean = effective.split(' ')[0].trim();

    if (clean == 'C') {
      return KeySignatureData(
        effectiveKey: effective,
        symbol: '♮',
        summary: 'Natural (0 ♯/♭)',
        count: 0,
        type: 'natural',
        accidentals: const [],
      );
    }

    if (majorSharpsCount.containsKey(clean)) {
      final cnt = majorSharpsCount[clean]!;
      final acc = sharpsOrder.sublist(0, cnt);
      final label = cnt == 1 ? 'Sharp' : 'Sharps';
      return KeySignatureData(
        effectiveKey: effective,
        symbol: '$cnt♯',
        summary: '$cnt $label (${acc.join(", ")})',
        count: cnt,
        type: 'sharps',
        accidentals: acc,
      );
    }

    if (majorFlatsCount.containsKey(clean)) {
      final cnt = majorFlatsCount[clean]!;
      final acc = flatsOrder.sublist(0, cnt);
      final label = cnt == 1 ? 'Flat' : 'Flats';
      return KeySignatureData(
        effectiveKey: effective,
        symbol: '$cnt♭',
        summary: '$cnt $label (${acc.join(", ")})',
        count: cnt,
        type: 'flats',
        accidentals: acc,
      );
    }

    return KeySignatureData(
      effectiveKey: effective,
      symbol: '♮',
      summary: 'Natural (0 ♯/♭)',
      count: 0,
      type: 'natural',
      accidentals: const [],
    );
  }

  /// Calculates frequency for note with semitone offset
  static double getFrequency(String rootKey, int semitones) {
    final transposed = transposeKey(rootKey, semitones);
    return standardFrequencies[transposed] ?? 440.0;
  }

  /// Stop any currently sounding pitch
  Future<void> stopPitch() async {
    _playSessionId++;
    try {
      await _channel.invokeMethod('stopPitchTone');
    } catch (_) {}
    _isPlaying = false;
    _currentlySoundingKey = null;
    notifyListeners();
  }

  /// Sound natural acoustic piano/organ chime pitch via hardware audio
  Future<void> soundPitch(String rootKey, int semitones) async {
    final sessionId = ++_playSessionId;
    final transposedKey = transposeKey(rootKey, semitones);
    final freq = getFrequency(rootKey, semitones);

    _isPlaying = true;
    _currentlySoundingKey = transposedKey;
    notifyListeners();

    try {
      await _channel.invokeMethod('playPitchTone', {
        'frequency': freq,
        'durationMs': 2400,
      });
    } catch (e) {
      debugPrint('Pitch tone playback exception (running in emulator/web fallback): $e');
    }

    // Acoustic tone duration timer
    await Future.delayed(const Duration(milliseconds: 2400));

    // Only reset state if this session is still the active one
    if (_playSessionId == sessionId) {
      _isPlaying = false;
      _currentlySoundingKey = null;
      notifyListeners();
    }
  }
}
