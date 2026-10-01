import 'package:flutter/material.dart';

class QuickKeypadDialog extends StatefulWidget {
  final Function(int number) onSelectNumber;

  const QuickKeypadDialog({super.key, required this.onSelectNumber});

  @override
  State<QuickKeypadDialog> createState() => _QuickKeypadDialogState();
}

class _QuickKeypadDialogState extends State<QuickKeypadDialog> {
  String _digits = '';

  void _pressDigit(String d) {
    if (_digits.length < 4) {
      setState(() {
        _digits += d;
      });
    }
  }

  void _backspace() {
    if (_digits.isNotEmpty) {
      setState(() {
        _digits = _digits.substring(0, _digits.length - 1);
      });
    }
  }

  void _submit() {
    final num = int.tryParse(_digits);
    if (num != null && num > 0) {
      widget.onSelectNumber(num);
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = theme.colorScheme.primary;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Jump to Hymn #',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                height: 52,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: accent.withOpacity(0.4), width: 1.5),
                ),
                child: Text(
                  _digits.isEmpty ? '—' : '#$_digits',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                    color: accent,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
              const SizedBox(height: 14),
              // Dial Grid
              Column(
                children: [
                  _buildRow(['1', '2', '3']),
                  const SizedBox(height: 8),
                  _buildRow(['4', '5', '6']),
                  const SizedBox(height: 8),
                  _buildRow(['7', '8', '9']),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: _backspace,
                          child: const Icon(Icons.backspace_outlined, size: 20),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(child: _buildDigitButton('0')),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: accent,
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: _digits.isNotEmpty ? _submit : null,
                          child: const Icon(Icons.check, size: 22),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(List<String> digits) {
    return Row(
      children: digits.map((d) {
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: _buildDigitButton(d),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDigitButton(String digit) {
    return FilledButton.tonal(
      style: FilledButton.styleFrom(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(vertical: 12),
      ),
      onPressed: () => _pressDigit(digit),
      child: Text(
        digit,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }
}
