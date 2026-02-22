import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma-db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Проверяем доступность Prisma.dmmf при загрузке модуля
if (typeof Prisma === 'undefined' || !Prisma.dmmf) {
  console.warn('Prisma.dmmf недоступен при загрузке модуля')
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableName = searchParams.get('tableName')
    const dbType = (searchParams.get('dbType') || 'production') as 'local' | 'production'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    if (!tableName) {
      return NextResponse.json({ error: 'Имя таблицы не указано' }, { status: 400 })
    }

    const prisma = getPrismaClient(dbType)

    // Проверяем доступность Prisma.dmmf
    if (!Prisma.dmmf || !Prisma.dmmf.datamodel || !Prisma.dmmf.datamodel.models) {
      console.error('Prisma.dmmf недоступен')
      return NextResponse.json({ 
        error: 'Ошибка конфигурации',
        message: 'Метаданные Prisma недоступны'
      }, { status: 500 })
    }

    // Находим модель по имени таблицы (dbName, model name или camelCase для Prisma Client)
    const tableNameLower = tableName.toLowerCase()
    const model = Prisma.dmmf.datamodel.models.find((m) => {
      const dbName = (m as { dbName?: string }).dbName
      const clientKey = m.name.charAt(0).toLowerCase() + m.name.slice(1)
      return (
        dbName === tableName ||
        dbName === tableNameLower ||
        m.name === tableName ||
        m.name.toLowerCase() === tableNameLower ||
        clientKey === tableName ||
        clientKey === tableNameLower
      )
    })

    if (!model) {
      console.error(`Модель не найдена для таблицы: ${tableName}`)
      console.error('Доступные модели:', Prisma.dmmf.datamodel.models.map(m => ({ name: m.name, dbName: m.dbName })))
      return NextResponse.json({ 
        error: 'Таблица не найдена',
        message: `Таблица "${tableName}" не найдена в схеме Prisma`
      }, { status: 404 })
    }

    const modelName = model.name
    const modelInstanceName = modelName.charAt(0).toLowerCase() + modelName.slice(1)
    const modelInstance = (prisma as any)[modelInstanceName]

    if (!modelInstance) {
      console.error(`Экземпляр модели не найден: ${modelInstanceName}`)
      console.error('Доступные методы prisma:', Object.keys(prisma).filter(key => !key.startsWith('_')))
      return NextResponse.json({ 
        error: 'Модель недоступна',
        message: `Не удалось получить доступ к модели "${modelInstanceName}". Доступные модели: ${Object.keys(prisma).filter(key => !key.startsWith('_') && typeof (prisma as any)[key] === 'object').join(', ')}`
      }, { status: 500 })
    }

    // Получаем общее количество записей
    let total = 0
    try {
      total = await modelInstance.count()
      console.log(`Подсчет записей для ${tableName}: ${total}`)
    } catch (error: any) {
      console.error('Ошибка при подсчете записей:', error)
      console.error('Тип ошибки:', error?.constructor?.name)
      console.error('Стек ошибки:', error?.stack)
      throw new Error(`Не удалось подсчитать записи: ${error.message || String(error)}`)
    }

    // Получаем данные с пагинацией
    const skip = (page - 1) * pageSize
    const includes = getIncludes(model)
    let data = []
    try {
      const queryOptions: any = {
        skip,
        take: pageSize,
      }
      
      // Добавляем include только если есть связи
      if (includes && Object.keys(includes).length > 0) {
        queryOptions.include = includes
      }
      
      data = await modelInstance.findMany(queryOptions)
    } catch (error: any) {
      console.error('Ошибка при получении данных:', error)
      console.error('Параметры запроса:', { skip, take: pageSize, includes })
      throw new Error(`Не удалось получить данные: ${error.message}`)
    }

    // Трансформируем поля модели
    let fields = model.fields
      .filter((field) => {
        // Исключаем обратные связи (массивы, которые не имеют relationFromFields)
        if (field.relationName && field.isList && !field.relationFromFields?.length) {
          return false
        }
        // Для таблицы users заменяем userType на category
        if (tableName === 'users' && field.name === 'userType') {
          return false // Исключаем userType, добавим category отдельно
        }
        return true
      })
      .map((field) => ({
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        isId: field.isId,
        relationName: field.relationName,
      }))

    // Для таблицы users добавляем виртуальное поле category и трансформируем данные
    if (tableName === 'users') {
      // Добавляем поле category в список полей
      fields = fields.map((field) => {
        if (field.name === 'userTypeId') {
          // Заменяем userTypeId на category
          return {
            name: 'category',
            type: 'String',
            isRequired: field.isRequired,
            isId: false,
            relationName: undefined,
          }
        }
        return field
      })

      // Трансформируем данные: заменяем userType на category
      data = data.map((record: any) => {
        const transformed: any = { ...record }
        if (transformed.userType) {
          transformed.category = transformed.userType.category
        } else {
          transformed.category = ''
        }
        // Удаляем объект userType, оставляем только category
        delete transformed.userType
        return transformed
      })
    }

    return NextResponse.json({
      tableName,
      fields,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error('Ошибка при получении данных таблицы:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка при получении данных таблицы',
        message: error?.message || String(error),
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Получаем includes для связанных моделей
function getIncludes(model: any) {
  const includes: any = {}
  for (const field of model.fields) {
    // Включаем только прямые связи (не обратные)
    if (field.relationName && field.relationFromFields && field.relationFromFields.length > 0) {
      includes[field.name] = true
    }
  }
  return Object.keys(includes).length > 0 ? includes : undefined
}
