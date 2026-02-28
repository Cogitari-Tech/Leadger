-- ==========================================================
-- Seed: LGPD, GDPR, ISO 27001 frameworks and controls
-- tenant_id = NULL → system-wide (visible to all tenants)
-- ==========================================================

-- ---- LGPD (Lei Geral de Proteção de Dados) ----
INSERT INTO audit_frameworks (id, tenant_id, name, description, version, is_system)
VALUES ('a0000000-0000-0000-0000-000000000001', NULL, 'LGPD', 'Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)', '2018', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_framework_controls (framework_id, code, title, description, category, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Art. 6',  'Princípios do Tratamento',      'Finalidade, adequação, necessidade, livre acesso, qualidade, transparência, segurança, prevenção, não discriminação e responsabilização.', 'Princípios', 1),
('a0000000-0000-0000-0000-000000000001', 'Art. 7',  'Bases Legais do Tratamento',     'Hipóteses em que o tratamento de dados pessoais é permitido (consentimento, obrigação legal, execução de contrato, etc.).', 'Bases Legais', 2),
('a0000000-0000-0000-0000-000000000001', 'Art. 8',  'Consentimento do Titular',       'O consentimento deve ser fornecido por escrito ou por outro meio que demonstre a manifestação de vontade do titular.', 'Consentimento', 3),
('a0000000-0000-0000-0000-000000000001', 'Art. 11', 'Dados Sensíveis',                'Tratamento de dados pessoais sensíveis (origem racial, convicção religiosa, saúde, etc.).', 'Dados Sensíveis', 4),
('a0000000-0000-0000-0000-000000000001', 'Art. 14', 'Dados de Crianças/Adolescentes', 'Tratamento deve ser realizado com consentimento específico de um dos pais ou responsável.', 'Menores', 5),
('a0000000-0000-0000-0000-000000000001', 'Art. 18', 'Direitos do Titular',            'Confirmação, acesso, correção, anonimização, portabilidade, eliminação, revogação do consentimento.', 'Direitos', 6),
('a0000000-0000-0000-0000-000000000001', 'Art. 37', 'Registro de Atividades',         'O controlador e o operador devem manter registro das operações de tratamento de dados pessoais.', 'Governança', 7),
('a0000000-0000-0000-0000-000000000001', 'Art. 38', 'Relatório de Impacto',           'A ANPD poderá determinar ao controlador que elabore relatório de impacto à proteção de dados pessoais (RIPD).', 'Governança', 8),
('a0000000-0000-0000-0000-000000000001', 'Art. 41', 'Encarregado (DPO)',              'O controlador deverá indicar encarregado pelo tratamento de dados pessoais.', 'Governança', 9),
('a0000000-0000-0000-0000-000000000001', 'Art. 46', 'Segurança e Sigilo',             'Medidas de segurança, técnicas e administrativas aptas a proteger os dados de acessos não autorizados e de situações acidentais.', 'Segurança', 10),
('a0000000-0000-0000-0000-000000000001', 'Art. 47', 'Responsabilidade do Agente',     'Os agentes de tratamento devem adotar medidas de segurança desde a fase de concepção até a execução.', 'Segurança', 11),
('a0000000-0000-0000-0000-000000000001', 'Art. 48', 'Comunicação de Incidente',       'O controlador deverá comunicar à ANPD e ao titular a ocorrência de incidente de segurança que possa acarretar risco.', 'Incidentes', 12),
('a0000000-0000-0000-0000-000000000001', 'Art. 49', 'Sistemas de Tratamento',         'Os sistemas utilizados para o tratamento de dados pessoais devem ser estruturados de forma a atender aos requisitos de segurança.', 'Segurança', 13),
('a0000000-0000-0000-0000-000000000001', 'Art. 50', 'Boas Práticas e Governança',     'Controladores e operadores poderão formular regras de boas práticas e de governança.', 'Governança', 14),
('a0000000-0000-0000-0000-000000000001', 'Art. 52', 'Sanções Administrativas',        'Advertência, multa simples (até 2% do faturamento), multa diária, publicização da infração, bloqueio ou eliminação de dados.', 'Sanções', 15);

-- ---- GDPR (General Data Protection Regulation) ----
INSERT INTO audit_frameworks (id, tenant_id, name, description, version, is_system)
VALUES ('a0000000-0000-0000-0000-000000000002', NULL, 'GDPR', 'General Data Protection Regulation (EU) 2016/679', '2016', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_framework_controls (framework_id, code, title, description, category, sort_order) VALUES
('a0000000-0000-0000-0000-000000000002', 'Art. 5',  'Principles of Processing',       'Lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity, accountability.', 'Principles', 1),
('a0000000-0000-0000-0000-000000000002', 'Art. 6',  'Lawfulness of Processing',       'Processing shall be lawful only if consent, contract, legal obligation, vital interest, public interest, or legitimate interest.', 'Legal Basis', 2),
('a0000000-0000-0000-0000-000000000002', 'Art. 7',  'Conditions for Consent',         'The controller shall be able to demonstrate that the data subject has consented.', 'Consent', 3),
('a0000000-0000-0000-0000-000000000002', 'Art. 9',  'Special Categories of Data',     'Processing of personal data revealing racial origin, political opinions, religious beliefs, health data, etc.', 'Sensitive Data', 4),
('a0000000-0000-0000-0000-000000000002', 'Art. 12', 'Transparent Information',        'The controller shall take appropriate measures to provide information in a concise, transparent, intelligible and easily accessible form.', 'Transparency', 5),
('a0000000-0000-0000-0000-000000000002', 'Art. 13', 'Information at Collection',      'Where personal data is collected from the data subject, the controller shall provide identity, purpose, recipients, retention, rights.', 'Transparency', 6),
('a0000000-0000-0000-0000-000000000002', 'Art. 17', 'Right to Erasure',               'The data subject shall have the right to obtain erasure of personal data without undue delay.', 'Data Subject Rights', 7),
('a0000000-0000-0000-0000-000000000002', 'Art. 20', 'Right to Data Portability',      'The data subject shall have the right to receive personal data in a structured, commonly used and machine-readable format.', 'Data Subject Rights', 8),
('a0000000-0000-0000-0000-000000000002', 'Art. 25', 'Data Protection by Design',      'The controller shall implement appropriate technical and organisational measures for data protection by design and by default.', 'Security', 9),
('a0000000-0000-0000-0000-000000000002', 'Art. 30', 'Records of Processing',          'Each controller shall maintain a record of processing activities under its responsibility.', 'Governance', 10),
('a0000000-0000-0000-0000-000000000002', 'Art. 32', 'Security of Processing',         'The controller and processor shall implement appropriate technical and organisational measures to ensure security.', 'Security', 11),
('a0000000-0000-0000-0000-000000000002', 'Art. 33', 'Notification of Data Breach',    'The controller shall notify the supervisory authority within 72 hours of becoming aware of a personal data breach.', 'Incidents', 12),
('a0000000-0000-0000-0000-000000000002', 'Art. 35', 'Data Protection Impact Assessment', 'Where processing is likely to result in a high risk, the controller shall carry out a DPIA.', 'Governance', 13),
('a0000000-0000-0000-0000-000000000002', 'Art. 37', 'Designation of DPO',             'The controller and the processor shall designate a data protection officer.', 'Governance', 14);

-- ---- ISO 27001:2022 (Information Security) ----
INSERT INTO audit_frameworks (id, tenant_id, name, description, version, is_system)
VALUES ('a0000000-0000-0000-0000-000000000003', NULL, 'ISO 27001:2022', 'Information Security Management Systems — Annex A Controls', '2022', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO audit_framework_controls (framework_id, code, title, description, category, sort_order) VALUES
('a0000000-0000-0000-0000-000000000003', 'A.5.1',  'Políticas de Segurança da Informação',         'Conjunto de políticas aprovadas pela direção, publicadas e comunicadas.', 'A.5 Controles Organizacionais', 1),
('a0000000-0000-0000-0000-000000000003', 'A.5.2',  'Papéis e Responsabilidades de SI',             'Definição e atribuição de papéis e responsabilidades de segurança da informação.', 'A.5 Controles Organizacionais', 2),
('a0000000-0000-0000-0000-000000000003', 'A.5.3',  'Segregação de Funções',                        'Funções e áreas de responsabilidade conflitantes devem ser segregadas.', 'A.5 Controles Organizacionais', 3),
('a0000000-0000-0000-0000-000000000003', 'A.5.10', 'Uso Aceitável de Ativos',                      'Regras para o uso aceitável de informações e ativos associados devem ser identificadas e documentadas.', 'A.5 Controles Organizacionais', 4),
('a0000000-0000-0000-0000-000000000003', 'A.5.23', 'Segurança em Serviços de Nuvem',               'Processos de aquisição, uso, gestão e saída de serviços de nuvem devem ser estabelecidos.', 'A.5 Controles Organizacionais', 5),
('a0000000-0000-0000-0000-000000000003', 'A.5.34', 'Privacidade e Proteção de Dados Pessoais',     'A privacidade e proteção de dados pessoais devem ser asseguradas conforme legislação aplicável.', 'A.5 Controles Organizacionais', 6),
('a0000000-0000-0000-0000-000000000003', 'A.6.1',  'Verificação de Antecedentes',                  'Verificações de background devem ser realizadas em todos os candidatos.', 'A.6 Controles de Pessoas', 7),
('a0000000-0000-0000-0000-000000000003', 'A.6.3',  'Conscientização em Segurança da Informação',   'Programa de conscientização, educação e treinamento em SI.', 'A.6 Controles de Pessoas', 8),
('a0000000-0000-0000-0000-000000000003', 'A.7.1',  'Perímetros de Segurança Física',               'Perímetros de segurança devem ser definidos para proteger áreas com informações sensíveis.', 'A.7 Controles Físicos', 9),
('a0000000-0000-0000-0000-000000000003', 'A.8.1',  'Dispositivos de Usuário Final',                'Informações em dispositivos devem ser protegidas (MDM, criptografia, etc.).', 'A.8 Controles Tecnológicos', 10),
('a0000000-0000-0000-0000-000000000003', 'A.8.2',  'Direitos de Acesso Privilegiado',              'Alocação e uso de direitos de acesso privilegiado devem ser restritos e gerenciados.', 'A.8 Controles Tecnológicos', 11),
('a0000000-0000-0000-0000-000000000003', 'A.8.5',  'Autenticação Segura',                          'Tecnologias e procedimentos de autenticação segura devem ser implementados.', 'A.8 Controles Tecnológicos', 12),
('a0000000-0000-0000-0000-000000000003', 'A.8.7',  'Proteção contra Malware',                      'Proteção contra malware deve ser implementada e apoiada por conscientização dos usuários.', 'A.8 Controles Tecnológicos', 13),
('a0000000-0000-0000-0000-000000000003', 'A.8.8',  'Gestão de Vulnerabilidades Técnicas',          'Informações sobre vulnerabilidades técnicas devem ser obtidas, avaliadas e tratadas.', 'A.8 Controles Tecnológicos', 14),
('a0000000-0000-0000-0000-000000000003', 'A.8.9',  'Gestão de Configuração',                       'Configurações de hardware, software, serviços e redes devem ser estabelecidas e mantidas.', 'A.8 Controles Tecnológicos', 15),
('a0000000-0000-0000-0000-000000000003', 'A.8.11', 'Mascaramento de Dados',                        'O mascaramento de dados deve ser utilizado conforme a política de controle de acesso.', 'A.8 Controles Tecnológicos', 16),
('a0000000-0000-0000-0000-000000000003', 'A.8.12', 'Prevenção de Vazamento de Dados (DLP)',        'Medidas de prevenção de vazamento de dados devem ser aplicadas a informações sensíveis.', 'A.8 Controles Tecnológicos', 17),
('a0000000-0000-0000-0000-000000000003', 'A.8.15', 'Registro de Logs (Logging)',                   'Logs de atividades, exceções, falhas e eventos de SI devem ser produzidos e protegidos.', 'A.8 Controles Tecnológicos', 18),
('a0000000-0000-0000-0000-000000000003', 'A.8.24', 'Uso de Criptografia',                          'Regras para uso efetivo de criptografia, incluindo gestão de chaves, devem ser definidas.', 'A.8 Controles Tecnológicos', 19),
('a0000000-0000-0000-0000-000000000003', 'A.8.28', 'Codificação Segura',                           'Princípios de codificação segura devem ser aplicados ao desenvolvimento de software.', 'A.8 Controles Tecnológicos', 20);
