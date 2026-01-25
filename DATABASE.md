## Что есть в системе (сущности):

Zapis - записи очереди автомобилей на въезд
User1 — владелец, автор, полный доступ ко всем записям
User2 - куратор, просмотр записей
User3 - Контролёр, просмотр и создание записей
User4 - водитель, просмотр записи его автомобиля

## Ключевые правила:

- При входе система cпрашивает имя пользователя и в зависимости от типа User показывает доступную ему информацию из записей очереди

## Схема базы данных
- User: id (cuid), name, UserTypeID -> Category (User1, User2, User3, User4)
- Zapis: id, number (digit) , name (string) , trans (string), srokDost (date), datObr (Date), timObr (Time), datRazm (Date), timRazm(Time), telephon (string) 
- Category: id, category
- Индексы:
  Zapis(name)
- onDelete: Cascade для связей
