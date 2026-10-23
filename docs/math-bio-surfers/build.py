"""Build an offline-capable HTML page from its template and question bank."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def validate(data):
    ids = set()
    level_ids = {level['id'] for level in data['levels']}
    assert level_ids == {1, 2, 3, 4}, 'Expected four chapter levels'
    for kind in ('gates', 'sequences', 'bugs'):
        for item in data[kind]:
            assert item['level'] in level_ids
            assert item['source'] and item['section']
            if kind != 'bugs':
                assert item['id'] not in ids, 'Duplicate item ID'
                ids.add(item['id'])
            if kind == 'gates':
                assert len(item['options']) == len(set(item['options'])) == 3
                assert item['answer'] in (0, 1, 2)
                assert item['difficulty'] in (1, 2, 3)
                assert item['prompt'] and item['why']
            elif kind == 'sequences':
                assert 3 <= len(item['steps']) <= 6
                assert len(item['steps']) == len(set(item['steps']))
    assert 0 < data['passAccuracy'] <= 1
    for level in level_ids:
        assert sum(q['level'] == level for q in data['gates']) >= data['runQuestions']
        assert any(q['level'] == level for q in data['sequences'])
        assert any(q['level'] == level for q in data['bugs'])
    return data

if __name__ == '__main__':
    data = validate(json.loads((ROOT/'questions.json').read_text()))
    template = (ROOT/'game.template.html').read_text()
    assert template.count('__QUESTION_BANK__') == 1
    # Escape '<' to prevent a future question containing </script> closing the JSON block.
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    (ROOT/'index.html').write_text(template.replace('__QUESTION_BANK__', payload))
    print(f'Built index.html: {len(data["gates"])} questions, {len(data["sequences"])} procedures, {len(data["levels"])} levels')
