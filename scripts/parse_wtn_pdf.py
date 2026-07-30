import pypdf
import re
import json
import os

pdf_path = r"c:\Users\kteja\OneDrive\Desktop\mk\mk\mockmate\public\WTN Dump\MS1 MCQs.pdf"
reader = pypdf.PdfReader(pdf_path)

def parse_highlights(page):
    contents = page.get_contents()
    if isinstance(contents, list):
        stream_bytes = b"".join(c.get_data() for c in contents)
    elif contents is not None:
        stream_bytes = contents.get_data()
    else:
        return []
    
    stream_text = stream_bytes.decode('utf-8', errors='ignore')
    tokens = re.split(r'\s+', stream_text.strip())
    
    state_stack = []
    current_matrix = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0]
    current_color = (0.0, 0.0, 0.0)
    
    yellow_rects = []
    
    for i, token in enumerate(tokens):
        if token == 'q':
            state_stack.append({
                'matrix': list(current_matrix),
                'color': tuple(current_color)
            })
        elif token == 'Q':
            if state_stack:
                state = state_stack.pop()
                current_matrix = state['matrix']
                current_color = state['color']
        elif token == 'cm':
            try:
                args = [float(tokens[i-j]) for j in range(6, 0, -1)]
                o = current_matrix
                n = args
                current_matrix = [
                    o[0]*n[0] + o[2]*n[1],
                    o[1]*n[0] + o[3]*n[1],
                    o[0]*n[2] + o[2]*n[3],
                    o[1]*n[2] + o[3]*n[3],
                    o[0]*n[4] + o[2]*n[5] + o[4],
                    o[1]*n[4] + o[3]*n[5] + o[5]
                ]
            except Exception:
                pass
        elif token in ('rg', 'RG'):
            try:
                r = float(tokens[i-3])
                g = float(tokens[i-2])
                b = float(tokens[i-1])
                current_color = (r, g, b)
            except Exception:
                pass
        elif token == 're':
            try:
                x = float(tokens[i-4])
                y = float(tokens[i-3])
                w = float(tokens[i-2])
                h = float(tokens[i-1])
                
                m = current_matrix
                x0 = m[0]*x + m[2]*y + m[4]
                y0 = m[1]*x + m[3]*y + m[5]
                x1 = m[0]*(x+w) + m[2]*(y+h) + m[4]
                y1 = m[1]*(x+w) + m[3]*(y+h) + m[5]
                
                box = (min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1))
                
                is_filled = False
                for j in range(1, 4):
                    if i + j < len(tokens):
                        next_tok = tokens[i+j]
                        if next_tok in ('f', 'f*', 'F', 'b', 'B', 'b*', 'B*', 'fill'):
                            is_filled = True
                            break
                
                is_yellow = (abs(current_color[0] - 1.0) < 0.1 and 
                             abs(current_color[1] - 1.0) < 0.1 and 
                             current_color[2] < 0.2)
                
                if is_filled and is_yellow:
                    yellow_rects.append(box)
            except Exception:
                pass
                
    return yellow_rects

def get_page_text_runs(page):
    text_runs = []
    def visitor(text, cm, tm, fontDict, fontSize):
        if text.strip():
            tx = tm[4]
            ty = tm[5]
            ax = cm[0]*tx + cm[2]*ty + cm[4]
            ay = cm[1]*tx + cm[3]*ty + cm[5]
            text_runs.append({
                'text': text,
                'x': ax,
                'y': ay,
                'font': fontDict.get('/BaseFont', 'Unknown') if fontDict else 'Unknown',
                'size': fontSize
            })
    page.extract_text(visitor_text=visitor)
    return text_runs

def get_page_lines(page):
    runs = get_page_text_runs(page)
    rects = parse_highlights(page)
    
    left_runs = [r for r in runs if r['x'] < 290.0]
    right_runs = [r for r in runs if r['x'] >= 290.0]
    
    columns_lines = []
    
    for col_runs in (left_runs, right_runs):
        lines_dict = {}
        for r in col_runs:
            y = r['y']
            found = False
            for ky in lines_dict:
                if abs(ky - y) < 4.0:
                    lines_dict[ky].append(r)
                    found = True
                    break
            if not found:
                lines_dict[y] = [r]
                
        sorted_ys = sorted(lines_dict.keys(), reverse=True)
        col_lines = []
        for y in sorted_ys:
            line_runs = sorted(lines_dict[y], key=lambda x: x['x'])
            line_text = " ".join(r['text'] for r in line_runs)
            
            highlighted = False
            for r in line_runs:
                for rx0, ry0, rx1, ry1 in rects:
                    if (rx0 - 5 <= r['x'] <= rx1 + 5) and (ry0 - 5 <= r['y'] <= ry1 + 10):
                        highlighted = True
                        break
            col_lines.append({
                'text': line_text,
                'highlighted': highlighted
            })
        columns_lines.append(col_lines)
        
    return columns_lines

def is_real_question_line(line_text, num, last_q_num):
    if num < last_q_num - 5:
        return False
        
    content = re.sub(r'^\d+\.', '', line_text).strip()
    if not content:
        return False
        
    if content in ('}', '};', '{', '});', '})', '];', ']'):
        return False
        
    if re.match(r'^\s*\}?\s*$', content):
        return False
        
    if last_q_num < 15:
        if content.endswith(';') or content.endswith('{'):
            if any(w in content for w in ('class', 'interface', 'void', 'public', 'private', 'static', 'int ', 'double ', 'long ', 'float ', 'boolean ', 'String ', '=')):
                return False
                
    return True

questions = []
current_question = None
current_topic = "General"
last_q_num = 0
parsed_q_nums = set()

for page_idx in range(len(reader.pages)):
    left_lines, right_lines = get_page_lines(reader.pages[page_idx])
    
    for lines in (left_lines, right_lines):
        filtered_lines = []
        for l in lines:
            t = l['text'].strip()
            if not t:
                continue
            if t == str(page_idx + 1):
                continue
            if t.startswith("Topic:"):
                current_topic = t.replace("Topic:", "").strip()
                continue
            filtered_lines.append(l)
            
        for line in filtered_lines:
            text = line['text'].strip()
            highlighted = line['highlighted']
            
            q_match = re.match(r'^(\d+)\.(.*)', text)
            
            is_real_q = False
            if q_match:
                q_num = int(q_match.group(1))
                if is_real_question_line(text, q_num, last_q_num):
                    is_real_q = True
            
            if is_real_q and q_num not in parsed_q_nums:
                if current_question:
                    questions.append(current_question)
                
                q_text = q_match.group(2).strip()
                current_question = {
                    'id': f"wtn_m1_{q_num}",
                    'type': 'mcq',
                    'question': q_text,
                    'options': [],
                    'answer': '',
                    'section': current_topic,
                    'domain': 'Wipro TalentNext M1'
                }
                last_q_num = q_num
                parsed_q_nums.add(q_num)
                continue
                
            opt_match = re.match(r'^([a-eA-E])\)\s*(.*)', text)
            if not opt_match:
                opt_match = re.match(r'^([a-eA-E])\s+(.*)', text)
                
            if opt_match and current_question:
                opt_letter = opt_match.group(1).lower()
                opt_text = opt_match.group(2).strip()
                
                current_question['options'].append(opt_text)
                if highlighted:
                    current_question['answer'] = opt_text
                continue
                
            if current_question:
                if len(current_question['options']) > 0:
                    current_question['options'][-1] += " " + text
                    if highlighted:
                        current_question['answer'] = current_question['options'][-1]
                else:
                    current_question['question'] += "\n" + text

if current_question:
    questions.append(current_question)

# Post-process questions
fallback_count = 0
for q in questions:
    q['question'] = q['question'].strip()
    q['options'] = [o.strip() for o in q['options'] if o.strip()]
    q['answer'] = q['answer'].strip()
    
    # Extract code blocks
    if "public class" in q['question'] or "public interface" in q['question'] or "System.out.println" in q['question'] or "class MyClass" in q['question']:
        lines = q['question'].split('\n')
        question_lines = []
        code_lines = []
        in_code = False
        
        for l in lines:
            if re.match(r'^\d+\.\s*', l) or "interface" in l or "class" in l or "void" in l or "{" in l or "}" in l or "System.out" in l or ";" in l or l.strip() == "":
                in_code = True
            
            if in_code and l.strip():
                cleaned_code_line = re.sub(r'^\d+\.\s*', '', l)
                code_lines.append(cleaned_code_line)
            else:
                question_lines.append(l)
                
        if code_lines:
            q['code'] = "\n".join(code_lines)
            q['question'] = "\n".join(question_lines).strip()
            
    q['type'] = "mcq"
    
    if not q['answer'] and len(q['options']) > 0:
        q['answer'] = q['options'][0]
        fallback_count += 1

print(f"Total questions parsed: {len(questions)}")
print(f"Fallbacks applied: {fallback_count}")

# Save
data_dir = r"c:\Users\kteja\OneDrive\Desktop\mk\mk\mockmate\data"
os.makedirs(data_dir, exist_ok=True)
output_path = os.path.join(data_dir, "wtn-m1-questions.json")

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"Saved questions to {output_path}")
