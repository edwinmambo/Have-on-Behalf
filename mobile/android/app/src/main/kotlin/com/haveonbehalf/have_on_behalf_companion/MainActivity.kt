package com.haveonbehalf.have_on_behalf_companion

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import kotlin.concurrent.thread
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.haveonbehalf/pitch_audio"
    private var currentTrack: AudioTrack? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "playPitchTone" -> {
                    val frequency = call.argument<Double>("frequency") ?: 440.0
                    val durationMs = call.argument<Int>("durationMs") ?: 2400
                    playTone(frequency, durationMs)
                    result.success(true)
                }
                "stopPitchTone" -> {
                    stopTone()
                    result.success(true)
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    private fun stopTone() {
        try {
            currentTrack?.let { track ->
                if (track.playState == AudioTrack.PLAYSTATE_PLAYING) {
                    track.stop()
                }
                track.release()
            }
            currentTrack = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun playTone(frequency: Double, durationMs: Int) {
        thread {
            try {
                stopTone()
                val sampleRate = 44100
                val numSamples = (sampleRate * (durationMs / 1000.0)).toInt()
                val buffer = ShortArray(numSamples)

                val attackTime = 0.02
                for (i in 0 until numSamples) {
                    val time = i.toDouble() / sampleRate
                    val envelope = if (time < attackTime) {
                        time / attackTime
                    } else {
                        exp(-(time - attackTime) * 1.8)
                    }

                    // Multi-harmonic additive synthesis (warm acoustic piano/organ chime)
                    val fundamental = sin(2.0 * PI * frequency * time)
                    val harmonic2 = 0.35 * sin(2.0 * PI * frequency * 2.0 * time) * exp(-time * 2.5)
                    val harmonic3 = 0.15 * sin(2.0 * PI * frequency * 3.0 * time) * exp(-time * 3.5)

                    val sampleValue = (fundamental + harmonic2 + harmonic3) * envelope * 0.75
                    val clamped = sampleValue.coerceIn(-1.0, 1.0)
                    buffer[i] = (clamped * Short.MAX_VALUE).toInt().toShort()
                }

                val minBufferSize = AudioTrack.getMinBufferSize(
                    sampleRate,
                    AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT
                )

                val track = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(maxOf(buffer.size * 2, minBufferSize))
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()

                currentTrack = track
                track.write(buffer, 0, buffer.size)
                track.play()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onDestroy() {
        stopTone()
        super.onDestroy()
    }
}
