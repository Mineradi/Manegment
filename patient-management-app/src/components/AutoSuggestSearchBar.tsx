import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Patient } from '../types/models';
import { colors, radius, spacing } from '../theme/theme';
import { useClinicStore } from '../store/ClinicStore';

/**
 * Large, always-on-top search bar.
 * Every keystroke filters the Firestore-backed local cache instantly and
 * renders a dropdown with Name, Village + Patient ID so duplicate names are
 * easy to tell apart. Tapping a row opens the profile immediately.
 */
export function AutoSuggestSearchBar({
  onSelect,
}: {
  onSelect: (patient: Patient) => void;
}) {
  const { search, patients } = useClinicStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    setResults(search(query));
  }, [query, search, patients]);

  const selectPatient = (p: Patient) => {
    setQuery(p.name);
    setResults([]);
    setFocused(false);
    Keyboard.dismiss();
    onSelect(p);
  };

  const showDropdown = focused && results.length > 0;

  return (
    <View style={styles.wrap}>
      <View style={[styles.searchBox, focused && styles.searchBoxFocused]}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search patient by name, village or phone…"
          placeholderTextColor={colors.subtext}
          autoCorrect={false}
          autoCapitalize="words"
          style={styles.input}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={12}>
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        )}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {results.map((p, idx) => (
            <Pressable
              key={p.id}
              onPress={() => selectPatient(p)}
              style={({ pressed }) => [
                styles.suggestion,
                idx === 0 && styles.suggestionFirst,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.suggestionMain}>
                <Text style={styles.suggestionName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.suggestionMeta} numberOfLines={1}>
                  {p.village || p.city || '—'} · {p.id}
                  {p.phone ? ` · ${p.phone}` : ''}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 58,
  },
  searchBoxFocused: { borderColor: colors.primary },
  icon: { fontSize: 20, marginRight: spacing.sm },
  input: { flex: 1, fontSize: 17, color: colors.text, paddingVertical: 0 },
  clear: { fontSize: 18, color: colors.subtext, paddingHorizontal: 6 },
  dropdown: {
    position: 'absolute',
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 360,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionFirst: {},
  suggestionMain: { flex: 1, marginRight: spacing.sm },
  suggestionName: { fontSize: 16, fontWeight: '700', color: colors.text },
  suggestionMeta: { fontSize: 13, color: colors.subtext, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.subtext },
  pressed: { backgroundColor: colors.primaryLight },
});
